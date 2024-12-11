"use server";

import fs from "node:fs";
import querystring from "querystring";
import axios, { AxiosInstance } from "axios";
import { AO3_LINK } from "@/consts";
import { wrapper } from "axios-cookiejar-support";
import tough from "tough-cookie";
import { getCredentials, refreshSession } from "@/db/db";
import { Credentials } from "@/db/types";

let ao3Client: AO3Client | null = null;

export async function getAo3Client() {
  if (ao3Client) {
    return ao3Client;
  }
  const credentials = await getCredentials("AO3");
  if (!credentials) {
    throw new Error("No AO3 credentials found");
  }
  ao3Client = new AO3Client(credentials);
  await ao3Client.login();
  return ao3Client;
}

class AO3Client {
  private cookieJar: tough.CookieJar;
  private axiosInstance: AxiosInstance;
  private defaultHeaders: object = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "he,en-US;q=0.9,en;q=0.8,de;q=0.7",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    Pragma: "no-cache",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    "sec-ch-ua":
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "Upgrade-Insecure-Requests": "1",
  };

  constructor(credentials: Credentials) {
    this.cookieJar = new tough.CookieJar();
    if (credentials.session) {
      this.setSessionCookies(credentials.session);
    }
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
      const cookie = new tough.Cookie({
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
    const cookieKeys = ["_otwarchive_session", "remember_user_token"];
    const session = cookies
      .filter((cookie) => {
        cookieKeys.includes(cookie.key);
      })
      .map((cookie) => {
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
    config: { method: string; url: string; data?: any; headers?: any },
    retry = true
  ): Promise<T> {
    try {
      config.headers = { ...this.defaultHeaders, ...config.headers };
      config.headers.Cookie =
        (await this.cookieJar.getSetCookieStrings(AO3_LINK))?.join("; ") || "";
      console.log({ cookie: config.headers.Cookie });
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      if (retry && error.response?.status === 401) {
        console.warn("Session expired. Re-logging in...");
        return this.request<T>(config, false);
      }
      throw error;
    }
  }

  public async login(): Promise<void> {
    const currentCookies = await this.cookieJar.getCookies(AO3_LINK);
    if (
      currentCookies.length > 0 &&
      currentCookies[0].expires &&
      currentCookies[0].expires > new Date()
    ) {
      return;
    }
    const credentials = await getCredentials("AO3");
    const tokenUrl = `${AO3_LINK}/token_dispenser.json`;
    const loginUrl = `${AO3_LINK}/users/login`;

    try {
      const tokenResponse = await this.axiosInstance.get(tokenUrl);
      const decryptedPassword = credentials?.password;
      const data = {
        authenticity_token: tokenResponse.data.token,
        "user[login]": credentials?.username,
        "user[password]": decryptedPassword,
        "user[remember_me]": 1,
        commit: "Log in",
      };
      const encodedData = querystring.stringify(data);

      await this.axiosInstance.post(loginUrl, encodedData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://archiveofourown.org/users/login",
          Origin: "https://archiveofourown.org",
        },
      });

      const cookies = await this.cookieJar.store.getAllCookies();
      this.setSessionCookies(cookies);
    } catch (error) {
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

  public async downloadFanfic(
    url: string,
    downloadPath: string
  ): Promise<void> {
    const response = await this.request<unknown>({
      method: "GET",
      url,
      headers: { responseType: "stream" },
    });

    const fileStream = fs.createWriteStream(downloadPath);

    await new Promise<void>((resolve, reject) => {
      (response as any)
        .pipe(fileStream)
        .on("finish", resolve)
        .on("error", reject);
    });
  }
}

// view_adult=true; remember_user_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6Ilcxc3hNekE1TURVNVhTd2lKREpoSkRFMEpHSm1URE53TjBKd04zWklTRkp0V1cxQ05HOUtVblVpTENJeE56TXhOalEzTVRNM0xqVTNOakk0TmpZaVhRPT0iLCJleHAiOiIyMDI1LTAyLTE1VDA1OjA1OjM3LjU3NloiLCJwdXIiOi
// Jjb29raWUucmVtZW1iZXJfdXNlcl90b2tlbiJ9fQ%3D%3D--adba512e2e50ca655ba6ba3fca2630641dd37701; user_credentials=1; _cfuvid=L4zlNeh2GpFvz3CfUTUaG8Tg1PhwvPl2oHBNic3i5ck-1733932906409-0.0.1.1-604800000; __cf_bm=BRccCJyCwVLkbv9DNwJ7M1qrSJOFYNmWrEHLrdDooqU-17339329
// 06-1.0.1.1-mfaKo_VtZjpbkK6xuTyp8XoHJrfifC1_uGOa7FmjCucr.U9..X_4LQ0IBa725qZrT16Fq6UBvRdPTEjfr6ZSTw; cf_clearance=TGEqXACkMgFqpqw.6w8703I8p6bP4tPiphqPR6FWE28-1733932920-1.2.1.1-VAn0ULMYoTM5f7wAb0ADRVGQ9rAklHiM7tURhG6XtVmjTJnTH58U28.QV_aHsiHwBP0vgMT5e0b7vcTm
// lTNFnGu2Lt02lcaypDxy7ZZWb8xB4Y0gvov2ffH4ZAjVPZAyVyfb8wBxH06ReNTsPNPb5mla0wsf.gpLty121tDC1qZwQIr1rA6g5FJLA7mP0vFHQ1i_bVUMOQFdVoe3nPCN5pE7EG98l69penDrUgWLplgJU15diRyBLl1MTco1CC3vNa9MQfTbhki4uHmYG6wm0YzrzbqPgpaR4FHbdrrDCkzQJldf6.SQ_GeMWpGqjLYKBGOKW8Mx.2RuelG
// AZR0PGt86bXjEQpJSb16ugGoQRbJZid1t6AOzucDm6fjE7OCNEvWBAlfXqFiDb2sjG0kq0A; _otwarchive_session=eyJfcmFpbHMiOnsibWVzc2FnZSI6ImV5SnpaWE56YVc5dVgybGtJam9pT0RJNFl6QTNORFEzWVRnMFlqRmtORGc1TkRObE1HWm1OamxtT0RWak4ySWlMQ0ozWVhKa1pXNHVkWE5sY2k1MWMyVnlMbXRsZVNJNlcxc3
// hNekE1TURVNVhTd2lKREpoSkRFMEpHSm1URE53TjBKd04zWklTRkp0V1cxQ05HOUtVblVpWFN3aVgyTnpjbVpmZEc5clpXNGlPaUo1YmpaRFZXSk5XbkkyU1hsMWIzWnpkVUV4UVdOUE1HZFBVbkZWUjB3MmNsbDNNRTlWVFdwRU4zVmpJaXdpY21WMGRYSnVYM1J2SWpvaUwzZHZjbXR6THpJeU16STNOamcwTDJOb1lYQjBaWEp6THpVek16T
// TBNemd5SW4wPSIsImV4cCI6IjIwMjQtMTItMjVUMTY6MDI6MDAuMzYxWiIsInB1ciI6ImNvb2tpZS5fb3R3YXJjaGl2ZV9zZXNzaW9uIn19--f4164113a08c362d2748cf89720fad0410ebad5b
