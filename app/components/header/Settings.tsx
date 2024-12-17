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

export function SettingsModal() {
  const setEmail = useSettingsStore((state) => state.setEmail);
  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const languageCode = useSettingsStore((state) => state.languageCode);
  const setLanguageCode = useSettingsStore((state) => state.setLanguageCode);

  const shouldTranslate = Boolean(languageCode);

  const handleSubmit = async (formData: FormData) => {
    const emailInput = formData.get("email") as string;
    const enableTranslation = formData.get("enableTranslation") as
      | string
      | null;

    setEmail(emailInput);
    setLanguageCode(enableTranslation ? "en" : null);
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
      </div>
    </DrawerDialog>
  );
}
