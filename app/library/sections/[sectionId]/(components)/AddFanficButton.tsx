"use client";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { AO3_LINK } from "@/consts";
import { useToast } from "@/hooks/use-toast";
import { addFanfic } from "@/library/sections/[sectionId]/(server)/addFanfic";
import { useUser } from "@clerk/nextjs";
import { ClipboardPlus } from "lucide-react";
import { useTransition } from "react";

export function AddFanficButton({ sectionId }: { sectionId: number }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const handleAddFanficFromClipboard = async () => {
    const title = "Add Fanfic";
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText.startsWith(`${AO3_LINK}/works/`)) {
      startTransition(async () => {
        const result = await addFanfic(sectionId, user.id, clipboardText);
        if (result.success) {
          toast({ title, description: "Added Successfully!" });
        } else {
          toast({ title, description: result.message, variant: "destructive" });
        }
      });
    } else {
      toast({
        title,
        description: "Invalid URL. Please copy a valid AO3 fanfic link",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
}
