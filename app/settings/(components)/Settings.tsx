"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { saveSettings } from "@/db/settings";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
] as const;

interface SettingsProps {
  settings: {
    id?: number;
    kindleEmail: string | null;
    languageCode: string;
    enableTranslation: boolean;
  };
  userId: string;
}

export function Settings({ settings, userId }: SettingsProps) {
  console.log("Settings", settings);
  const { theme, systemTheme, setTheme } = useTheme();
  const { watch, handleSubmit, setValue } = useForm({
    defaultValues: {
      email: settings?.kindleEmail || "",
      languageCode: settings?.languageCode || "en",
      enableTranslation: settings?.enableTranslation || false,
    },
  });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const enableTranslation = watch("enableTranslation");
  const email = watch("email");

  const isCurrentThemeLight = Boolean(theme ? theme === "light" : systemTheme === "light");

  async function onSubmit(data: { email: string; languageCode: string; enableTranslation: boolean }) {
    console.log("onSubmit", data);
    startTransition(async () => {
      try {
        await saveSettings({
          id: settings?.id,
          userId,
          kindleEmail: data.email,
          languageCode: data.languageCode,
          enableTranslation: data.enableTranslation,
        });
        toast({
          title: "Settings",
          description: "Your settings have been saved",
        });
      } catch (error) {
        console.error(error);
        throw new Error("Failed to save settings");
      }
    });
  }

  const content = [
    {
      label: "Appearance",
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
              <Sun className="hidden dark:block" />
              <Moon className="block dark:hidden" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          ),
        },
      ],
    },
    {
      label: "Epub Settings",
      description: "Configure your reading preferences",
      fields: [
        {
          label: "Email",
          description: "Send content to your device",
          component: (
            <Input
              defaultValue={settings?.kindleEmail || ""}
              onChange={(e) => setValue("email", e.target.value)}
              placeholder="enter your email"
              className="text-sm"
            />
          ),
        },
        {
          label: "Translation",
          description: "Enable automatic translation",
          component: (
            <Switch
              disabled={!email}
              checked={enableTranslation}
              onCheckedChange={(checked) => {
                setValue("enableTranslation", checked);
                if (!checked) setValue("languageCode", "en");
              }}
            />
          ),
        },
        {
          label: "Language",
          description: "Select your preferred language",
          component: (
            <Select
              disabled={!enableTranslation}
              defaultValue={settings?.languageCode || "en"}
              onValueChange={(value) => setValue("languageCode", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
        },
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto p-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Separator />

        {content.map((section, index) => (
          <div key={index} className="space-y-3">
            <div>
              <h3 className="text-lg font-medium">{section.label}</h3>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="flex flex-col gap-6">
              {section.fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={field.label.toLowerCase()}>{field.label}</Label>
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  </div>
                  <div className="flex justify-end w-1/3">{field.component}</div>
                </div>
              ))}
              {index !== content.length - 1 && <Separator />}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
