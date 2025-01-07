"use client";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import { useSettingsStore } from "../../store";
import { Moon, SettingsIcon, Sun } from "lucide-react";
import React from "react";

import { Switch } from "../../components/ui/switch";
import { useTheme } from "next-themes";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { Separator } from "@/components/ui/separator";

export function SettingsModal() {
  const { theme, systemTheme, setTheme } = useTheme();
  const setKindleEmail = useSettingsStore((state) => state.setEmail);
  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const languageCode = useSettingsStore((state) => state.languageCode);
  const setLanguageCode = useSettingsStore((state) => state.setLanguageCode);

  const isCurrentThemeLight = Boolean(
    theme ? theme === "light" : systemTheme === "light"
  );

  const shouldTranslate = Boolean(languageCode);

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon size={25} />
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent className="space-y-6 px-6 pb-10">
        <DrawerDialogHeader>
          <DrawerDialogTitle className="text-xl font-semibold">
            Settings
          </DrawerDialogTitle>
        </DrawerDialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <Button
                onClick={() => setTheme(isCurrentThemeLight ? "dark" : "light")}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                {isCurrentThemeLight ? <Sun /> : <Moon />}
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <h3 className="font-medium">Kindle Settings</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email">Kindle Email</Label>
                <p className="text-sm text-muted-foreground">
                  Send content to your device
                </p>
              </div>
              <Input
                onBlur={(e) => setKindleEmail(e.target.value)}
                id="email"
                name="email"
                defaultValue={kindleEmail}
                placeholder="kindle@amazon.com"
                className="w-[180px] text-sm"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <h3 className="font-medium">Translation</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableTranslation">English Translation</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically translate content to English
                </p>
              </div>
              <Switch
                color="primary"
                id="enableTranslation"
                name="enableTranslation"
                defaultChecked={shouldTranslate}
                onClick={() => setLanguageCode(shouldTranslate ? "en" : null)}
              />
            </div>
          </div>
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
