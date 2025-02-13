import { getSettings } from "@/db/settings";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { Settings } from "./(components)/Settings";

export const metadata: Metadata = {
  title: "Settings - Fanfic",
};

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const settings = await getSettings(user.id);

  return <Settings settings={settings} userId={user.id} />;
}
