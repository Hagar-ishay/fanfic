"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "./DrawerDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Folder } from "lucide-react";

interface Section {
  id: number;
  name: string;
  parentId: number | null;
}

interface SectionPickerProps {
  sections: Section[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sectionId: number, setAsDefault: boolean) => void;
  defaultSectionId?: number | null;
}

export function SectionPicker({
  sections,
  isOpen,
  onClose,
  onSelect,
  defaultSectionId,
}: SectionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedSectionId) {
      onSelect(selectedSectionId, setAsDefault);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedSectionId(null);
    setSetAsDefault(false);
    onClose();
  };

  return (
    <DrawerDialog open={isOpen} onOpenChange={handleClose}>
      <DrawerDialogContent className="sm:max-w-[425px]">
        <DrawerDialogHeader>
          <DrawerDialogTitle>Choose Section</DrawerDialogTitle>
          <DrawerDialogDescription>
            Select a section to add this fanfic to your library.
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Section List */}
          <ScrollArea className="h-[200px] border rounded-md">
            <div className="p-2 space-y-1">
              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-accent ${
                    selectedSectionId === section.id ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedSectionId(section.id)}
                >
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{section.name}</span>
                  {defaultSectionId === section.id && (
                    <span className="text-xs text-muted-foreground">(default)</span>
                  )}
                </div>
              ))}
              {filteredSections.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No sections found
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Set as Default Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="setAsDefault"
              checked={setAsDefault}
              onCheckedChange={(checked) => setSetAsDefault(checked === true)}
            />
            <Label htmlFor="setAsDefault" className="text-sm">
              Set as my default section
            </Label>
          </div>
        </div>

        <DrawerDialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedSectionId}>
            Add to Section
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}