"use client";

import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveSettings } from "@/db/settings";
import { createIntegration, deleteIntegration } from "@/db/integrations";
import { useToast } from "@/hooks/use-toast";
import {
  Moon,
  Sun,
  Plus,
  Trash2,
  Settings as SettingsIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { NewIntegrationForm } from "./NewIntegrationForm";

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
    activeIntegrationId: number | null;
    defaultSectionId: number | null;
    languageCode: string;
    enableTranslation: boolean;
  };
  integrations: Array<{
    id: number;
    type: string;
    name: string;
    config: Record<string, unknown>;
    isActive: boolean;
  }>;
  sections: Array<{
    id: number;
    name: string;
    parentId: number | null;
  }>;
  userId: string;
}

export function Settings({ settings, integrations, sections, userId }: SettingsProps) {
  const { theme, systemTheme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { watch, handleSubmit, setValue, reset } = useForm<{
    activeIntegrationId: number | null;
    defaultSectionId: number | null;
    languageCode: string;
    enableTranslation: boolean;
  }>({
    defaultValues: {
      activeIntegrationId: null,
      defaultSectionId: null,
      languageCode: "en",
      enableTranslation: false,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Set form values after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    reset({
      activeIntegrationId: settings?.activeIntegrationId ?? null,
      defaultSectionId: settings?.defaultSectionId ?? null,
      languageCode: settings?.languageCode ?? "en",
      enableTranslation: settings?.enableTranslation ?? false,
    });
  }, [settings, reset]);

  const enableTranslation = watch("enableTranslation");

  // Don't render form content until mounted
  if (!mounted) {
    return (
      <div className="mx-auto p-4 sm:p-6 lg:p-10 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Settings
            </h2>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentThemeLight = Boolean(
    theme ? theme === "light" : systemTheme === "light"
  );

  function onSubmit(data: {
    activeIntegrationId: number | null;
    defaultSectionId: number | null;
    languageCode: string;
    enableTranslation: boolean;
  }) {
    startTransition(async () => {
      try {
        await saveSettings({
          id: settings?.id,
          userId,
          activeIntegrationId: data.activeIntegrationId,
          defaultSectionId: data.defaultSectionId,
          languageCode: data.languageCode,
          enableTranslation: data.enableTranslation,
        });
        toast({
          title: "Settings",
          description: "Your settings have been saved",
        });
      } catch {
        throw new Error("Failed to save settings");
      }
    });
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit(onSubmit)(e);
  };

  const handleCreateIntegrationWrapper = (
    type: string,
    config: Record<string, string>,
    category: string
  ) => {
    void handleCreateIntegration(type, config, category);
  };

  async function handleCreateIntegration(
    type: string,
    config: Record<string, string>,
    category: string
  ) {
    try {
      // Use type as name since there's only one per type
      const name =
        type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");

      await createIntegration({
        userId,
        category,
        type,
        name,
        config,
        isActive: integrations.length === 0,
      });

      toast({
        title: "Integration Created",
        description: `${name} integration created successfully`,
      });

      setIsDialogOpen(false);
      // Refresh to show the new integration
      router.refresh();
    } catch (error) {
      toast({
        title: "Integration Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create integration",
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
      router.refresh();
    } catch {
      toast({
        title: "Delete Failed",
        description: "Failed to delete integration",
        variant: "destructive",
      });
    }
  }

  const generalSettings = [
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
      label: "Library Settings",
      description: "Configure your personal library preferences",
      fields: [
        {
          label: "Default Section",
          description: "Choose which section new fanfics are added to by default",
          component: (
            <Select
              defaultValue={settings?.defaultSectionId?.toString() || "none"}
              onValueChange={(value) => setValue("defaultSectionId", value === "none" ? null : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default section</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    <div className="bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 pt-8 pb-6 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Settings
            </h2>
            <p className="text-base text-muted-foreground mt-2">
              Manage your account settings and preferences.
            </p>
          </div>

          <Separator className="opacity-50" />

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {generalSettings.map((section, index) => (
                  <div
                    key={index}
                    className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {section.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    </div>
                    <div className="space-y-6">
                      {section.fields.map((field, fieldIndex) => (
                        <div
                          key={fieldIndex}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
                        >
                          <div className="space-y-1 flex-1">
                            <Label
                              htmlFor={field.label.toLowerCase()}
                              className="text-sm font-medium"
                            >
                              {field.label}
                            </Label>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {field.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
                            {field.component}
                          </div>
                        </div>
                      ))}
                      {index !== generalSettings.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-center sm:justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto"
                  >
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-medium">
                    Integrations
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage your cloud storage and email integrations
                  </p>
                </div>

                <div className="space-y-4">
                  {integrations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No integrations configured
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {integrations.map((integration) => (
                        <div
                          key={integration.id}
                          className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 gap-3"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <SettingsIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {integration.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {integration.type.replace("_", " ")}{" "}
                                {integration.isActive && "• Active"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              void handleDeleteIntegration(
                                integration.id,
                                integration.name
                              );
                            }}
                            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Integration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Add New Integration</DialogTitle>
                      </DialogHeader>
                      <NewIntegrationForm
                        onSubmit={handleCreateIntegrationWrapper}
                        onCancel={() => setIsDialogOpen(false)}
                        onSuccess={() => {
                          setIsDialogOpen(false);
                          router.refresh();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
