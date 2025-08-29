import { getSettings } from "@/db/settings";
import { Metadata } from "next";
import { Settings } from "./(components)/Settings";
import { auth } from "@/auth";
import { getIntegrations } from "@/db/integrations";
export const metadata: Metadata = {
  title: "Settings - Fanfic",
};

export default async function Page() {
  const { user } = (await auth())!;

  const settings = await getSettings(user.id);
  const integrations = await getIntegrations(user.id);

  return (
    <Settings
      settings={settings}
      integrations={integrations}
      userId={user.id}
    />
  );
}
