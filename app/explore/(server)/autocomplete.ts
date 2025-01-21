"use server";
import { getAo3Client } from "@/lib/ao3Client";

export async function autocomplete(name: string, value: string) {
  const ao3Client = await getAo3Client();
  const options = await ao3Client.autocomplete(name, value);
  return options.map(({ id }) => id);
}
