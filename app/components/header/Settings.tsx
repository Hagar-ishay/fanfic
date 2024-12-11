"use client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

import { useSettingsStore } from "../../store";
import { SettingsIcon } from "lucide-react";
import React from "react";

import { Switch } from "../ui/switch";
import { DrawerDialog } from "@/components/base/DrawerDialog";
import { Credentials } from "@/db/types";
import { setCredentials } from "@/server/updater";
import { decryptPassword, encryptPassword } from "@/lib/utils";

export function SettingsModal({
  credentials,
}: {
  credentials: Credentials | null;
}) {
  const setEmail = useSettingsStore((state) => state.setEmail);
  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const languageCode = useSettingsStore((state) => state.languageCode);
  const setLanguageCode = useSettingsStore((state) => state.setLanguageCode);
  const decryptedPassword = credentials?.password
    ? decryptPassword(credentials.password)
    : "";

  const shouldTranslate = Boolean(languageCode);

  const handleSubmit = async (formData: FormData) => {
    const emailInput = formData.get("email") as string;
    const enableTranslation = formData.get("enableTranslation") as
      | string
      | null;
    const password = formData.get("ao3Password") as string;
    const username = formData.get("ao3Username") as string;
    const encryptedPassword = encryptPassword(password);

    setEmail(emailInput);
    setLanguageCode(enableTranslation ? "en" : null);
    await setCredentials(username, encryptedPassword, "AO3");
  };

  return (
    <DrawerDialog
      tooltip="Settings"
      trigger={
        <Button size="icon" className="w-10">
          <SettingsIcon />
        </Button>
      }
      title="Settings"
      formAction={handleSubmit}
    >
      <div className="gap-5 py-4 flex flex-col">
        <div className="flex flex-row gap-2 justify-between text-sm items-center">
          <Label className="ml-1">Email</Label>
          <Input
            id="email"
            name="email"
            defaultValue={kindleEmail}
            placeholder="Enter Kindle Email"
            className="w-52"
          />
        </div>
        <div className="flex flex-row gap-2 justify-between text-sm items-center">
          <Label className="ml-1">Translate to English</Label>
          <Switch
            id="enableTranslation"
            name="enableTranslation"
            defaultChecked={shouldTranslate}
          />
        </div>
        <Separator />
        <Label className="ml-1 font-semibold">AO3 Credentials</Label>
        <div className="flex flex-row gap-2 justify-between text-sm items-center">
          <Label className="ml-1">Username</Label>
          <Input
            id="ao3Username"
            name="ao3Username"
            defaultValue={credentials?.username || ""}
            placeholder="Enter username"
            className="w-52"
          />
        </div>
        <div className="flex flex-row gap-2 justify-between text-sm items-center">
          <Label className="ml-1">Password</Label>
          <Input
            type="password"
            id="ao3Password"
            name="ao3Password"
            defaultValue={decryptedPassword}
            placeholder="Enter password"
            className="w-52"
          />
        </div>
      </div>
    </DrawerDialog>
  );
}
