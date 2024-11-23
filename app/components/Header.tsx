"use client";

import { addFanfic, checkForUpdates } from "@/server/updater";
import { useSearchStore } from "../store";
import { UserButton } from "@clerk/nextjs";
import { ClipboardPlus, RotateCw, Search, X } from "lucide-react";
import type React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { AO3_LINK } from "@/consts";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/base/Tooltip";
import { SettingsModal } from "@/components/Settings";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [isPending, startTransition] = useTransition();
  const { searchInput, setSearchInput } = useSearchStore();

  async function handleCheckForUpdates() {
    startTransition(async () => {
      const result = await checkForUpdates();
      if (result.success) {
        if (!result.isCache) {
          for (const fanficTitle of result.data.updatedFanfics)
            toast.success(`Fic ${fanficTitle} updated successfully`);
        }
      } else {
        toast.error(`An error occurred: ${result.data}`);
      }
    });
  }

  const handleAddFanficFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.startsWith(`${AO3_LINK}/works/`)) {
        startTransition(async () => {
          const result = await addFanfic(3, clipboardText);
          if (result.success) {
            toast.success("Fanfic added successfully");
          } else if (
            result.message?.includes(
              "duplicate key value violates unique constraint"
            )
          ) {
            toast.error("This fic already exists :)");
          } else {
            toast.error(`An error occurred: ${result.message}`);
          }
        });
      } else {
        toast.error("Invalid URL. Please copy a valid AO3 fanfic URL");
      }
    } catch (error) {
      console.error("Failed to read from clipboard: ", error);
      toast.error("Failed to read from clipboard");
    }
  };

  return (
    <div className="sticky top-0 z-20 p-4 shadow-md flex flex-row justify-between gap-2">
      <div className="flex items-center ml-2">
        <UserButton />
      </div>
      <div className="flex items-center justify-end gap-2">
        <div className="justify-center relative">
          <Input
            value={searchInput}
            className="pl-8"
            placeholder="Search"
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          {searchInput && (
            <Button
              onClick={() => setSearchInput("")}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <X />
            </Button>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <Tooltip description="Check for updates">
            <Button
              size="icon"
              className="ml-4 w-10"
              onClick={handleCheckForUpdates}
              disabled={isPending}
            >
              <LoadableIcon DefaultIcon={RotateCw} isPending={isPending} />
            </Button>
          </Tooltip>

          <Tooltip description="Add Fanfic from clipboard">
            <Button
              className="w-10"
              size="icon"
              onClick={handleAddFanficFromClipboard}
              disabled={isPending}
            >
              <LoadableIcon DefaultIcon={ClipboardPlus} isPending={isPending} />
            </Button>
          </Tooltip>
          <SettingsModal />
        </div>
      </div>
    </div>
  );
}
