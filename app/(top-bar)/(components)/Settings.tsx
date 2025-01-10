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

  const content = [
    {
      label: "Appearance",
      description: "Change the appearance of the app",
      fields: [
        {
          label: "Theme",
          description: "Switch between light and dark mode",
          component: (
            <Button
              onClick={() => setTheme(isCurrentThemeLight ? "dark" : "light")}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              {isCurrentThemeLight ? <Sun /> : <Moon />}
            </Button>
          ),
        },
      ],
    },
    {
      label: "Epub Settings",
      description: "Send content to your device",
      fields: [
        {
          label: "Email",
          description: "Send content to your device",
          component: (
            <Input
              onBlur={(e) => setKindleEmail(e.target.value)}
              id="email"
              name="email"
              defaultValue={kindleEmail}
              placeholder="enter your email"
              className="w-[180px] text-sm"
            />
          ),
        },
        {
          label: "English Translation",
          description: "Automatically translate content to English",
          component: (
            <Switch
              color="primary"
              id="enableTranslation"
              name="enableTranslation"
              defaultChecked={shouldTranslate}
              onClick={() => setLanguageCode(shouldTranslate ? "en" : null)}
            />
          ),
        },
      ],
    },
  ];

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
          {content.map((section, index) => (
            <div key={index} className="space-y-3 ">
              <h3 className="font-medium">{section.label}</h3>
              <div className="flex flex-col gap-6">
                {section.fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="email">{field.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {field.description}
                      </p>
                    </div>
                    {field.component}
                  </div>
                ))}
                {index !== content.length - 1 && <Separator />}
              </div>
            </div>
          ))}
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
