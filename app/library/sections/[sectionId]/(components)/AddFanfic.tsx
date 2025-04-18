"use client";

import { ClipboardPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addFanfic } from "../(server)/addFanfic";

export function AddFanfic({ sectionId, userId }: { sectionId: number; userId: string }) {
  const { toast } = useToast();

  const handleAddFanficFromClipboard = async () => {
    const title = "Add Fanfic";
    try {
      const clipboardText = await navigator.clipboard.readText();

      console.time("Total add fanfic operation");
      try {
        const result = await addFanfic(sectionId, userId, clipboardText);
        console.timeEnd("Total add fanfic operation");

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
        console.timeEnd("Total add fanfic operation");
        console.error("Error adding fanfic:", error);
        toast({
          title,
          description: error instanceof Error ? error.message : "Request timed out or failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Clipboard error:", error);
      toast({
        title,
        description: "Failed to read clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="default" onClick={handleAddFanficFromClipboard}>
      <ClipboardPlus />
      <p className="mt-1 text-[10px]">Add Fanfic</p>
    </Button>
  );
}
