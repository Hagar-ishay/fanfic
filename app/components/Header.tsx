"use client";

import { addFanfic, checkForUpdates } from "@/server/updater";
import { useSearchStore } from "@/store";
import { UserButton } from "@clerk/nextjs";
import { ClipboardPlus, RotateCw, Search, X } from "lucide-react";
import type React from "react";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { AO3_LINK } from "@/consts";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/base/Tooltip";
import { SettingsModal } from "@/components/Settings";
import { Input } from "@/components/ui/input";

export default function Header() {
  const { toast } = useToast();

  const [isPendingUpdates, startTransitionUpdates] = useTransition();
  const [isPendingAdd, startTransitionAdd] = useTransition();
  const { searchInput, setSearchInput } = useSearchStore();

  async function handleCheckForUpdates() {
    const title = "Checking for updates";
    startTransitionUpdates(async () => {
      const result = await checkForUpdates();
      if (result.success) {
        for (const fanficTitle of result.data.updatedFanfics)
          toast({
            title,
            description: `Fic ${fanficTitle} updated successfully`,
          });
      } else {
        toast({
          title,
          description: `An error occurred: ${result.message}`,
          variant: "destructive",
        });
      }
    });
  }

  const handleAddFanficFromClipboard = async () => {
    const title = "Add Fanfic";
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText.startsWith(`${AO3_LINK}/works/`)) {
      startTransitionAdd(async () => {
        const result = await addFanfic(3, clipboardText);
        if (result.success) {
          toast({
            title,
            description: "Added Successfully!",
          });
        } else {
          toast({
            title,
            description: result.message,
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title,
        description: "Invalid URL. Please copy a valid AO3 fanfic URL",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-row items-center justify-between w-full gap-3">
      <div className="flex justify-start">
        <UserButton />
      </div>
      <div className="flex flex-row items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 ">
        <div className="relative ">
          <Input
            value={searchInput}
            className="pl-8 bg-neutral-50"
            placeholder="Search"
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50 " />
          {searchInput && (
            <Button
              onClick={() => setSearchInput("")}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 "
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
              disabled={isPendingUpdates}
            >
              <LoadableIcon
                DefaultIcon={RotateCw}
                isPending={isPendingUpdates}
              />
            </Button>
          </Tooltip>

          <Tooltip description="Add Fanfic from clipboard">
            <Button
              className="w-10"
              size="icon"
              onClick={handleAddFanficFromClipboard}
              disabled={isPendingAdd}
            >
              <LoadableIcon
                DefaultIcon={ClipboardPlus}
                isPending={isPendingAdd}
              />
            </Button>
          </Tooltip>
          <SettingsModal />
        </div>
      </div>
    </div>
  );
}
