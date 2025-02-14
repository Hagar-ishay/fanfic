"use client";
import { ContextMenu } from "@/components/base/ContextMenu";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { AO3_LINK } from "@/consts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { addFanfic } from "@/library/sections/[sectionId]/(server)/addFanfic";
import { ClipboardPlus, EllipsisVertical, ListPlus } from "lucide-react";
import { useRef, useTransition } from "react";

export function Options({
  sectionId,
  userId,
}: {
  sectionId: number | null;
  userId: string;
}) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const triggerSectionRef = useRef<HTMLDivElement>(null);

  const handleAddFanficFromClipboard = async () => {
    const title = "Add Fanfic";
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.startsWith(`${AO3_LINK}/works/`)) {
        toast({
          title,
          description: "Invalid URL. Please copy a valid AO3 fanfic link",
          variant: "destructive",
        });
        return;
      }

      startTransition(async () => {
        console.time("Total add fanfic operation");
        try {
          const result = await addFanfic(sectionId!, userId, clipboardText);
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
            description:
              error instanceof Error
                ? error.message
                : "Request timed out or failed",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Clipboard error:", error);
      toast({
        title,
        description: "Failed to read clipboard",
        variant: "destructive",
      });
    }
  };

  const options = [
    ...(sectionId
      ? [
          {
            icon: <ClipboardPlus />,
            name: "Add Fanfic from Clipboard",
            action: handleAddFanficFromClipboard,
            isPending: isPending,
          },
        ]
      : []),
    {
      icon: <ListPlus />,
      name: "Add New Section",
      action: () => {
        triggerSectionRef.current?.click();
      },
    },
  ];

  return (
    <>
      <AddNewSectionButton sectionId={sectionId} ref={triggerSectionRef} />
      {isMobile ? (
        <ContextMenu
          options={options}
          trigger={
            <Button size="icon" variant="ghost">
              <EllipsisVertical />
            </Button>
          }
        />
      ) : (
        <>
          {options.map((option) => (
            <Tooltip description={option.name} key={option.name}>
              <Button
                size="icon"
                variant="default"
                onClick={option.action}
                disabled={option.isPending}
              >
                {option.isPending ? (
                  <LoadableIcon
                    defaultIcon={option.icon}
                    isPending={option.isPending}
                  />
                ) : (
                  option.icon
                )}
              </Button>
            </Tooltip>
          ))}
        </>
      )}
    </>
  );
}
