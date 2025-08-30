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
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface NewIntegrationFormProps {
  onSubmit: (
    type: string,
    config: Record<string, string>,
    category: string
  ) => void;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function NewIntegrationForm({
  onSubmit,
  onCancel,
  onSuccess,
}: NewIntegrationFormProps) {
  const [type, setType] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isCreatingGoogleDrive, setIsCreatingGoogleDrive] = useState(false);
  const { data: session } = useSession();

  const integrationTypes = [
    {
      value: "google_drive",
      label: "Google Drive",
      category: "cloud_storage",
      description:
        "Sync fanfics directly to your Google Drive for KOReader access. Uses your existing Google account for seamless integration.",
      docUrl: "https://developers.google.com/drive/api/guides/about-auth",
      configFields: ["name", "folderId"],
      isOAuth: true,
    },
    {
      value: "dropbox",
      label: "Dropbox",
      category: "cloud_storage",
      description: "Sync fanfics to Dropbox for cross-device access",
      docUrl:
        "https://www.dropbox.com/developers/documentation/http/documentation",
      configFields: ["accessToken"],
    },
    {
      value: "webdav",
      category: "cloud_storage",
      label: "WebDAV (Koofr/Nextcloud)",
      description:
        "Connect Google Drive via Koofr or use Nextcloud for KOReader sync",
      docUrl: "https://koofr.eu/help/koofr-webdav/",
      configFields: ["url", "username", "password"],
    },
    {
      value: "email",
      category: "delivery",
      label: "Email Delivery",
      description: "Send fanfics directly to your Kindle or e-reader email",
      docUrl:
        "https://www.amazon.com/gp/help/customer/display.html?nodeId=GX9XLEVV8G4DB28H",
      configFields: ["readerEmail"],
    },
  ];

  const selectedType = integrationTypes.find((t) => t.value === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit:", { type, selectedType, config });

    if (!type || !selectedType) {
      console.error("Missing type or selectedType");
      return;
    }

    // Handle Google Drive OAuth integration
    if (type === "google_drive") {
      await handleGoogleDriveIntegration();
      return;
    }

    const category = selectedType.category;

    const isValid = selectedType.configFields.every((field) => {
      // folderId is optional for Google Drive
      if (field === "folderId") {
        console.log(
          `Field ${field}: ${config[field]} -> optional (always valid)`
        );
        return true;
      }
      const hasValue = config[field]?.trim();
      console.log(
        `Field ${field}: ${config[field]} -> ${hasValue ? "valid" : "invalid"}`
      );
      return hasValue;
    });

    if (!isValid) {
      console.error("Form validation failed");
      return;
    }

    console.log("Form valid, submitting...");
    onSubmit(type, config, category);
  };

  const handleGoogleDriveIntegration = async () => {
    if (!session?.accessToken) {
      alert("Please sign out and sign in again to grant Google Drive permissions.");
      return;
    }

    setIsCreatingGoogleDrive(true);
    
    try {
      const response = await fetch("/api/integrations/google-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: config.name || "Google Drive",
          folderId: config.folderId || "root",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Integration was created successfully, close the form and refresh
        // Don't call onSubmit as that would create a duplicate integration
        if (onSuccess) {
          onSuccess();
        } else {
          onCancel();
        }
      } else {
        alert(result.error || "Failed to create Google Drive integration");
      }
    } catch (error) {
      console.error("Google Drive integration error:", error);
      alert("Failed to create Google Drive integration");
    } finally {
      setIsCreatingGoogleDrive(false);
    }
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
      name: "Integration Name",
      folderId: "Parent Folder ID (Optional)",
      readerEmail: "E-reader Email Address",
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field: string): string => {
    const placeholders: Record<string, string> = {
      url: "https://app.koofr.net/dav/Koofr",
      username: "your-username",
      password: "your-password",
      accessToken:
        field === "accessToken" && type === "google_drive"
          ? "Your Google Drive OAuth2 access token"
          : "Your access token",
      name: "My Google Drive",
      folderId: "Leave empty to use root folder",
      readerEmail: "your-kindle@kindle.com or personal email",
    };
    return placeholders[field] || "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Integration Type</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
            setConfig({});
          }}
        >
          <SelectTrigger className="w-full">
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

      {type && selectedType && (
        <>
          <div className="space-y-3 p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedType.description}
            </p>
            {type === "google_drive" && !session?.accessToken && (
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ Please sign out and sign in again to grant Google Drive permissions.
              </p>
            )}
            <a
              href={selectedType.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 inline-flex items-center gap-1 hover:underline"
            >
              Setup Documentation <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-4">
            {selectedType.configFields.map((field) => (
              <div key={field} className="space-y-2">
                <Label className="text-sm font-medium">
                  {getFieldLabel(field)}
                </Label>
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
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit" 
              size="sm" 
              className="w-full"
              disabled={isCreatingGoogleDrive}
            >
              {isCreatingGoogleDrive ? "Creating..." : "Create Integration"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="w-full"
              disabled={isCreatingGoogleDrive}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
