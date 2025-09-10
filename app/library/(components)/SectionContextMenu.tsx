"use client";

import { Section } from "@/db/types";
import { Trash2, Settings } from "lucide-react";
import React, { useState } from "react";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSection, updateSectionCleanup } from "@/db/sections";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function SectionContextMenu({
  section,
  trigger,
}: {
  section: Section;
  trigger: React.ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cleanupEnabled, setCleanupEnabled] = useState(section.enableIntegrationCleanup);

  async function onDelete() {
    await deleteSection(section.id);
  }

  async function onSaveSettings() {
    await updateSectionCleanup(section.id, cleanupEnabled);
    setSettingsOpen(false);
  }

  function onSettings() {
    setSettingsOpen(true);
  }

  const options = [
    {
      icon: <Settings size={17} />,
      name: "Section Settings",
      action: onSettings,
    },
    {
      icon: <Trash2 size={17} />,
      name: "Delete Section", 
      confirmationHeader: (
        <div className="flex flex-col gap-2">
          Are you sure you want to delete section {section.name} ?
          <div className="text-sm">
            Fics and Child sections belonging to this section will be removed from your library
          </div>
        </div>
      ),
      action: onDelete,
      destructive: true,
    },
  ];

  return (
    <>
      <ContextMenu header={section.name} options={options} trigger={trigger} />
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Section Settings - {section.name}</DialogTitle>
            <DialogDescription>
              Configure how this section behaves with integrations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="cleanup-toggle">Enable Integration Cleanup</Label>
                <p className="text-sm text-muted-foreground">
                  When fanfics are moved to this section, automatically clean them up from cloud storage integrations
                </p>
              </div>
              <Switch 
                id="cleanup-toggle"
                checked={cleanupEnabled}
                onCheckedChange={setCleanupEnabled}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setSettingsOpen(false)}
              className="px-4 py-2 text-sm border rounded hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              onClick={onSaveSettings}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
