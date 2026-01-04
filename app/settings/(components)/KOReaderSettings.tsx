"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, RefreshCw, BookOpen, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateKOReaderApiKey } from "@/lib/koreader/auth";

interface KOReaderSettingsProps {
  userId: string;
  hasApiKey: boolean;
}

export function KOReaderSettings({ userId, hasApiKey: initialHasApiKey }: KOReaderSettingsProps) {
  const [hasApiKey, setHasApiKey] = useState(initialHasApiKey);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copiedCatalog, setCopiedCatalog] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const catalogUrl = `${baseUrl}/api/koreader/opds/catalog`;

  const handleGenerateApiKey = () => {
    startTransition(async () => {
      try {
        const newApiKey = await generateKOReaderApiKey(userId);
        setApiKey(newApiKey);
        setHasApiKey(true);
        toast({
          title: "API Key Generated",
          description: "Your KOReader API key has been created. Copy it now - you won't see it again!",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to generate API key. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleCopyCatalog = async () => {
    await navigator.clipboard.writeText(catalogUrl);
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 2000);
    toast({
      title: "Copied!",
      description: "OPDS catalog URL copied to clipboard",
    });
  };

  const handleCopyApiKey = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey);
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">KOReader Integration</h2>
        <p className="text-muted-foreground mt-1">
          Sync your fanfics to KOReader on Kobo devices via OPDS catalog
        </p>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>OPDS Catalog Setup</CardTitle>
          </div>
          <CardDescription>
            Follow these steps to connect KOReader to your library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Generate API Key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <Label className="text-base font-medium">Generate API Key</Label>
            </div>
            <div className="ml-8 space-y-3">
              {!hasApiKey || apiKey ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Create a secure API key for authenticating your KOReader device
                  </p>
                  <Button
                    onClick={handleGenerateApiKey}
                    disabled={isPending}
                    variant={hasApiKey ? "outline" : "default"}
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : hasApiKey ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate API Key
                      </>
                    ) : (
                      "Generate API Key"
                    )}
                  </Button>

                  {apiKey && (
                    <div className="rounded-lg border bg-muted p-4 space-y-2">
                      <p className="text-sm font-medium text-destructive">
                        ⚠️ Copy this API key now - you won&apos;t be able to see it again!
                      </p>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={apiKey}
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyApiKey}
                        >
                          {copiedApiKey ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm">
                    ✓ API key exists. You can regenerate it if needed (old key will stop working).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Copy Catalog URL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </div>
              <Label className="text-base font-medium">Copy Catalog URL</Label>
            </div>
            <div className="ml-8 space-y-3">
              <p className="text-sm text-muted-foreground">
                Copy this URL to add the catalog to KOReader
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={catalogUrl}
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCatalog}
                >
                  {copiedCatalog ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Configure KOReader */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </div>
              <Label className="text-base font-medium">Configure KOReader</Label>
            </div>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                On your Kobo device with KOReader:
              </p>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Open KOReader → Search → OPDS Catalog</li>
                <li>Tap &quot;+&quot; to add a new catalog</li>
                <li>Paste the catalog URL</li>
                <li>Enter any username (ignored)</li>
                <li>Enter your API key as the password</li>
                <li>Save and browse your library!</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon - Progress Sync */}
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle>Reading Progress Sync (Coming Soon)</CardTitle>
          </div>
          <CardDescription>
            Bidirectional sync of reading progress between web app and KOReader
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feature is currently under development. Soon you&apos;ll be able to:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground mt-2">
            <li>Sync reading progress from Kobo to web app</li>
            <li>Continue reading on web where you left off on Kobo</li>
            <li>Automatic conflict resolution</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
