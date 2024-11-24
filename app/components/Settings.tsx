import { Tooltip } from "./base/Tooltip";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

import { useSettingsStore } from "../store";
import { SettingsIcon } from "lucide-react";
import React from "react";

import { Switch } from "./ui/switch";
import { DrawerDialog } from "@/components/base/DrawerDialog";

export function SettingsModal() {
  const setEmail = useSettingsStore((state) => state.setEmail);
  const setLanguageCode = useSettingsStore((state) => state.setLanguageCode);
  const kindleEmail = useSettingsStore((state) => state.kindleEmail);

  const [shouldTranslate, setShouldTranslate] = React.useState(
    useSettingsStore((state) => Boolean(state.languageCode))
  );

  const handleSubmit = async (formData: FormData) => {
    const emailInput = formData.get("email") as string;
    setEmail(emailInput);
    setLanguageCode((shouldTranslate ? "en" : null) || null);
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
      description="Configuration here is kept in your browser's cache"
      formAction={handleSubmit}
    >
      <div className="gap-5 py-4 flex flex-col">
        <Input
          id="email"
          name="email"
          defaultValue={kindleEmail}
          placeholder="Kindle email"
        />
        <div className="flex flex-row gap-2 justify-between text-sm font-medium">
          <Label className="ml-1">Translate to English</Label>
          <Switch
            id="enableTranslation"
            name="enableTranslation"
            checked={shouldTranslate}
            onCheckedChange={() => setShouldTranslate(!shouldTranslate)}
          />
        </div>
        <Separator />
      </div>
    </DrawerDialog>
  );
}
