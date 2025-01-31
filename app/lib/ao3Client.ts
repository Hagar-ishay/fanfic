"use server";

import fs from "node:fs";
import querystring from "querystring";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { AO3_LINK } from "@/consts";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar, Cookie } from "tough-cookie";
import { Credentials } from "@/db/types";
import { ENV } from "@/config";
import { getCredentials, refreshSession } from "@/db/credentials";

export async function getAo3Client() {
  const credentials = await getCredentials("AO3");
  if (!credentials) {
    throw new Error("No AO3 credentials found");
  }
  const ao3Client = new AO3Client();
  await ao3Client.login(credentials);
  return ao3Client;
}

export type AutoCompleteType =
  | "fandom"
  | "freeform"
  | "relationship"
  | "character";

class AO3Client {
  private cookieJar: CookieJar;
  private axiosInstance: AxiosInstance;
  private defaultHeaders: object = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept:
      "application/json,application/x-www-form-urlencoded,text/html,application/xhtml+xml,application/xml",
  };
  constructor() {
    this.cookieJar = new CookieJar();
    this.axiosInstance = wrapper(
      axios.create({
        jar: this.cookieJar,
        withCredentials: true,
      })
    );
  }

  private setCookies(
    cookies: {
      key: string;
      value: string;
      expires?: Date | null | "Infinity";
    }[]
  ) {
    cookies.map(({ key, value, expires }) => {
      const cookie = new Cookie({
        key,
        value,
        domain: AO3_LINK.replace(/^https?:\/\//, ""),
        expires: expires ? new Date(expires) : undefined,
        httpOnly: true,
        secure: true,
      });
      this.cookieJar.setCookieSync(cookie.cookieString(), AO3_LINK);
    });
  }

  private async setSessionCookies(
    cookies: { key: string; value: string; expires: Date | null | "Infinity" }[]
  ) {
    const session = cookies.map((cookie) => {
      return {
        key: cookie.key,
        value: cookie.value,
        expires: cookie.expires,
      };
    });
    await refreshSession("AO3", session);
    this.setCookies(session);
  }

  private async request<T>(
    config: {
      method: string;
      url: string;
      data?: any;
      headers?: any;
      responseType?: "stream";
    },
    useCookies = true
  ): Promise<T> {
    config.headers = { ...this.defaultHeaders, ...config.headers };
    if (useCookies) {
      config.headers.Cookie = (await this.cookieJar.store.getAllCookies())
        .map((cookie) => cookie.cookieString())
        .join("; ");
    }

    const response = await this.axiosInstance.request<T>(config);
    if (config.responseType === "stream") {
      return response as T;
    }
    return response.data;
  }

  public async login(credentials: Credentials): Promise<void> {
    if (
      credentials.session &&
      credentials.session?.length > 0 &&
      credentials.session.map(
        (cookie) =>
          !cookie.expires ||
          cookie.expires == "Infinity" ||
          new Date(cookie.expires).getTime() > Date.now()
      )
    ) {
      await this.setSessionCookies(credentials.session);
      return;
    }
    const tokenUrl = `${AO3_LINK}/token_dispenser.json`;
    const loginUrl = `${AO3_LINK}/users/login`;
    try {
      const tokenResponse = await this.axiosInstance.get(tokenUrl);
      const data = {
        authenticity_token: tokenResponse.data.token,
        "user[login]": ENV.AO3_USERNAME,
        "user[password]": ENV.AO3_PASSWORD,
        "user[remember_me]": 1,
        commit: "Log in",
      };
      const encodedData = querystring.stringify(data);

      await this.request(
        {
          method: "POST",
          url: loginUrl,
          data: encodedData,
          headers: {
            Referer: `${AO3_LINK}/users/login`,
          },
        },
        false
      );

      const cookies = (await this.cookieJar.store.getAllCookies()).map(
        (cookie) => ({
          key: cookie.key,
          value: cookie.value,
          expires: cookie.expires,
        })
      );

      await this.setSessionCookies(cookies);
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to login: ${error}`);
    }
  }

  public async getFanfic(fanficId: string): Promise<string> {
    const url = `${AO3_LINK}/works/${fanficId}?view_full_work=true&view_adult=true`;
    const response = await this.request<string>({ method: "GET", url });

    if (
      response.includes(
        "This work is only available to registered users of the Archive"
      )
    ) {
      throw new Error("Failed to authenticate to AO3");
    }
    return response;
  }

  public async autocomplete(
    type: string,
    query: string
  ): Promise<{ id: string; name: string }[]> {
    const url = `${AO3_LINK}/autocomplete/${type}?term=${query}`;
    return this.request({ method: "GET", url });
  }

  public async downloadFanfic(
    url: string,
    downloadPath: string
  ): Promise<void> {
    const response = await this.request<AxiosResponse>({
      method: "GET",
      url,
      responseType: "stream",
    });

    if (!response || !response.data) {
      throw new Error("Failed to fetch fanfic");
    }

    const fileStream = fs.createWriteStream(downloadPath);

    await new Promise<void>((resolve, reject) => {
      (response.data as NodeJS.ReadableStream)
        .pipe(fileStream)
        .on("finish", resolve)
        .on("error", reject);
    });
  }
}
