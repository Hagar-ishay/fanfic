"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { saveSettings } from "@/db/settings";
import {
  createIntegration,
  updateIntegration,
  deleteIntegration,
} from "@/db/integrations";
import { useToast } from "@/hooks/use-toast";
import {
  Moon,
  Sun,
  Plus,
  Trash2,
  Settings as SettingsIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTransition, useState } from "react";
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
    readerEmail: string | null;
    activeIntegrationId: number | null;
    languageCode: string;
    enableTranslation: boolean;
  };
  integrations: Array<{
    id: number;
    type: string;
    name: string;
    config: Record<string, any>;
    isActive: boolean;
  }>;
  userId: string;
}

export function Settings({ settings, integrations, userId }: SettingsProps) {
  console.log("Settings", settings);
  const { theme, systemTheme, setTheme } = useTheme();
  const { watch, handleSubmit, setValue } = useForm({
    defaultValues: {
      readerEmail: settings?.readerEmail || "",
      activeIntegrationId: settings?.activeIntegrationId || null,
      languageCode: settings?.languageCode || "en",
      enableTranslation: settings?.enableTranslation || false,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [showNewIntegration, setShowNewIntegration] = useState(false);
  const { toast } = useToast();

  const enableTranslation = watch("enableTranslation");
  const readerEmail = watch("readerEmail");

  const isCurrentThemeLight = Boolean(
    theme ? theme === "light" : systemTheme === "light"
  );

  async function onSubmit(data: {
    readerEmail: string;
    activeIntegrationId: number | null;
    languageCode: string;
    enableTranslation: boolean;
  }) {
    console.log("onSubmit", data);
    startTransition(async () => {
      try {
        await saveSettings({
          id: settings?.id,
          userId,
          readerEmail: data.readerEmail,
          activeIntegrationId: data.activeIntegrationId,
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

  async function handleCreateIntegration(
    type: string,
    name: string,
    config: Record<string, string>
  ) {
    try {
      await createIntegration({
        userId,
        type,
        name,
        config,
        isActive: integrations.length === 0,
      });

      toast({
        title: "Integration Created",
        description: `${name} integration created successfully`,
      });

      setShowNewIntegration(false);
      setNewIntegrationType("");
    } catch (error) {
      toast({
        title: "Integration Failed",
        description: "Failed to create integration",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteIntegration(id: number, name: string) {
    try {
      await deleteIntegration(id);
      toast({
        title: "Integration Deleted",
        description: `${name} integration deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete integration",
        variant: "destructive",
      });
    }
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
      label: "E-Reader Settings",
      description: "Configure your e-reader delivery preferences",
      fields: [
        {
          label: "E-Reader Email",
          description: "Email address to send books to your e-reader",
          component: (
            <Input
              defaultValue={settings?.readerEmail || ""}
              onChange={(e) => setValue("readerEmail", e.target.value)}
              placeholder="your-kindle@kindle.com or personal email"
              className="text-sm"
            />
          ),
        },
      ],
    },
    {
      label: "Integrations",
      description: "Manage your cloud storage and email integrations",
      fields: [
        {
          label: "Active Integrations",
          description:
            "Configure integrations for cloud sync and email delivery",
          component: (
            <div className="w-full space-y-3">
              {integrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No integrations configured
                </p>
              ) : (
                <div className="space-y-2">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <div className="flex items-center space-x-3">
                        <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {integration.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {integration.type}{" "}
                            {integration.isActive && "• Active"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteIntegration(
                            integration.id,
                            integration.name
                          )
                        }
                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Integration Button */}
              {!showNewIntegration ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewIntegration(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              ) : (
                <NewIntegrationForm
                  onSubmit={handleCreateIntegration}
                  onCancel={() => {
                    setShowNewIntegration(false);
                    setNewIntegrationType("");
                  }}
                />
              )}
            </div>
          ),
        },
      ],
    },
    {
      label: "Translation Settings",
      description: "Configure automatic translation for non-English content",
      fields: [
        {
          label: "Enable Translation",
          description:
            "Automatically translate content to your preferred language",
          component: (
            <Switch
              disabled={!readerEmail}
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
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto p-4 sm:p-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Separator />

        {content.map((section, index) => (
          <div key={index} className="space-y-3">
            <div>
              <h3 className="text-lg font-medium">{section.label}</h3>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              {section.fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={field.label.toLowerCase()}>
                      {field.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  </div>
                  <div className="flex justify-end w-1/3">
                    {field.component}
                  </div>
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

function NewIntegrationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (
    type: string,
    name: string,
    config: Record<string, string>
  ) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});

  const integrationTypes = [
    {
      value: "google_drive",
      label: "Google Drive",
      configFields: ["accessToken", "folderId"],
    },
    { value: "dropbox", label: "Dropbox", configFields: ["accessToken"] },
    {
      value: "webdav",
      label: "WebDAV Server (Koofr/Nextcloud)",
      configFields: ["url", "username", "password"],
    },
    {
      value: "email",
      label: "Email Delivery",
      configFields: [
        "smtp_host",
        "smtp_port",
        "smtp_username",
        "smtp_password",
        "from_email",
      ],
    },
  ];

  const selectedType = integrationTypes.find((t) => t.value === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !name || !selectedType) return;

    const isValid = selectedType.configFields.every((field) =>
      config[field]?.trim()
    );
    if (!isValid) return;

    onSubmit(type, name, config);
  };

  const updateConfig = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      url: "Server URL",
      username: "Username",
      password: "Password",
      accessToken: "Access Token",
      folderId: "Parent Folder ID (Optional)",
      smtp_host: "SMTP Host",
      smtp_port: "SMTP Port",
      smtp_username: "SMTP Username",
      smtp_password: "SMTP Password",
      from_email: "From Email",
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field: string): string => {
    const placeholders: Record<string, string> = {
      url: "https://app.koofr.net/dav/Koofr",
      username: "your-username", 
      password: "your-password",
      accessToken: field === "accessToken" && type === "google_drive" 
        ? "Your Google Drive OAuth2 access token" 
        : "Your access token",
      folderId: "Leave empty to use root folder",
      smtp_host: "smtp.gmail.com",
      smtp_port: "587", 
      smtp_username: "your-email@gmail.com",
      smtp_password: "your-app-password",
      from_email: "your-email@gmail.com",
    };
    return placeholders[field] || "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg bg-muted/30"
    >
      <div className="space-y-2">
        <Label>Integration Type</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
            setConfig({});
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select integration type" />
          </SelectTrigger>
          <SelectContent>
            {integrationTypes.map((intType) => (
              <SelectItem key={intType.value} value={intType.value}>
                {intType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type && (
        <>
          <div className="space-y-2">
            <Label>Integration Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`My ${selectedType?.label}`}
              required
            />
          </div>

          {selectedType?.configFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label>{getFieldLabel(field)}</Label>
              <Input
                type={
                  field.includes("password") || field.includes("token")
                    ? "password"
                    : "text"
                }
                value={config[field] || ""}
                onChange={(e) => updateConfig(field, e.target.value)}
                placeholder={getFieldPlaceholder(field)}
                required={field !== "folderId"}
              />
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" size="sm" className="flex-1 sm:flex-initial">
              Create Integration
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
