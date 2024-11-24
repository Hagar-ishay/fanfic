"use server";

import fs from "node:fs";
import axios from "axios";
import { AO3_LINK } from "@/consts";

const axiosInstance = axios.create({
  httpsAgent: new (require("https").Agent)({
    rejectUnauthorized: false,
  }),
});

export async function getFanfic(fanficId: string): Promise<string> {
  const url = `${AO3_LINK}/works/${fanficId}?view_full_work=true&view_adult=true`;

  try {
    const response = await axiosInstance.get(url, {
      responseType: "text",
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching fanfic: ${error}`);
    throw new Error(`Failed to fetch fanfic: ${error}`);
  }
}

export async function downloadFanfic(url: string, downloadPath: string) {
  try {
    const response = await axiosInstance({
      url,
      method: "GET",
      responseType: "stream",
    });

    const fileStream = fs.createWriteStream(downloadPath);

    await new Promise((resolve, reject) => {
      response.data.pipe(fileStream).on("finish", resolve).on("error", reject);
    });
  } catch (error) {
    console.error(`Error downloading fanfic: ${error}`);
    throw new Error(`Failed to download fanfic: ${error}`);
  }
}
