import { getSettings } from "@/db/settings";
import { listUserSections } from "@/db/sections";
import { Metadata } from "next";
import { Settings } from "./(components)/Settings";
import { auth } from "@/auth";
import { getIntegrations } from "@/db/integrations";
import { SetTopbar } from "@/components/base/SetTopbar";
export const metadata: Metadata = {
  title: "Settings - Fanfic",
};

export default async function Page() {
  const { user } = (await auth())!;

  const [settings, integrations, sections] = await Promise.all([
    getSettings(user.id),
    getIntegrations(user.id),
    listUserSections(user.id),
  ]);

  return (
    <>
      <SetTopbar segments={[{ label: "Settings", href: "/settings" }]} />
      <Settings
        settings={settings}
        integrations={integrations}
        sections={sections}
        userId={user.id}
      />
    </>
  );
}
