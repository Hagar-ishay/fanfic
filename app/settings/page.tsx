import { getSettings } from "@/db/settings";
import { Metadata } from "next";
import { Settings } from "./(components)/Settings";
import { auth } from "@/auth";
export const metadata: Metadata = {
  title: "Settings - Fanfic",
};

export default async function Page() {
  const { user } = (await auth())!;

  const settings = await getSettings(user.id);

  return <Settings settings={settings} userId={user.id} />;
}
