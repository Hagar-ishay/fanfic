"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookPlus, ChevronDown, Loader2 } from "lucide-react";
import { SectionPicker } from "./SectionPicker";
import { addFanficFromSearch, addFanficToDefaultSection } from "@/explore/(server)/addFromSearch";
import { saveSettings } from "@/db/settings";
import { SearchResult } from "@/explore/(server)/search";
import { toast } from "sonner";

interface Section {
  id: number;
  name: string;
  parentId: number | null;
}

interface AddToLibraryButtonProps {
  searchResult: SearchResult;
  sections: Section[];
  userId: string;
  defaultSectionId?: number | null;
  userSettingsId?: number;
}

export function AddToLibraryButton({
  searchResult,
  sections,
  userId,
  defaultSectionId,
  userSettingsId,
}: AddToLibraryButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showSectionPicker, setShowSectionPicker] = useState(false);

  const defaultSection = sections.find(s => s.id === defaultSectionId);

  const handleQuickAdd = () => {
    if (!defaultSectionId) {
      setShowSectionPicker(true);
      return;
    }

    startTransition(async () => {
      try {
        const result = await addFanficToDefaultSection(searchResult, userId);
        if (result.success) {
          toast.success(`Added "${searchResult.title}" to ${defaultSection?.name || 'your library'}`);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Failed to add fanfic to library");
      }
    });
  };

  const handleSectionSelect = (sectionId: number, setAsDefault: boolean) => {
    startTransition(async () => {
      try {
        const result = await addFanficFromSearch(searchResult, userId, sectionId);
        const selectedSection = sections.find(s => s.id === sectionId);
        
        if (result.success) {
          toast.success(`Added "${searchResult.title}" to ${selectedSection?.name || 'section'}`);
          
          // Update default section if requested
          if (setAsDefault && userSettingsId) {
            await saveSettings({
              id: userSettingsId,
              userId,
              defaultSectionId: sectionId,
              activeIntegrationId: null,
              languageCode: "en",
              enableTranslation: false,
            });
            toast.success(`Set "${selectedSection?.name}" as default section`);
          }
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Failed to add fanfic to library");
      }
    });
  };

  return (
    <>
      <div className="flex">
        {/* Main button */}
        <Button
          size="sm"
          onClick={handleQuickAdd}
          disabled={isPending}
          className="rounded-r-none border-r-0"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookPlus className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">
            Add to {defaultSection?.name || 'Library'}
          </span>
          <span className="ml-2 sm:hidden">Add</span>
        </Button>

        {/* Dropdown arrow */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="default"
              className="rounded-l-none px-2"
              disabled={isPending}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowSectionPicker(true)}>
              Choose different section...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SectionPicker
        sections={sections}
        isOpen={showSectionPicker}
        onClose={() => setShowSectionPicker(false)}
        onSelect={(sectionId, setAsDefault) => {
          handleSectionSelect(sectionId, setAsDefault);
        }}
        defaultSectionId={defaultSectionId}
      />
    </>
  );
}