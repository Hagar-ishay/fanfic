"use client";

import { ClipboardPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addFanfic } from "../(server)/addFanfic";
import logger from "@/logger";

export function AddFanfic({
  sectionId,
  userId,
}: {
  sectionId: number;
  userId: string;
}) {
  const { toast } = useToast();

  const handleAddFanficFromClipboard = async () => {
    const title = "Add Fanfic";
    try {
      const clipboardText = await navigator.clipboard.readText();

      try {
        const result = await addFanfic(sectionId, userId, clipboardText);

        if (result.success) {
          toast({ title, description: "Added Successfully!" });
        } else {
          toast({
            title,
            description: result.message || "Failed to add fanfic",
            variant: "destructive",
          });
        }
      } catch (error) {
        logger.error(`Error adding fanfic: ${error instanceof Error ? error.message : String(error)}`);
        toast({
          title,
          description:
            error instanceof Error
              ? error.message
              : "Request timed out or failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error(`Clipboard error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title,
        description: "Failed to read clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="default" onClick={() => { void handleAddFanficFromClipboard(); }}>
      <ClipboardPlus />
      <p className="mt-1 text-[10px]">Add Fanfic</p>
    </Button>
  );
}
