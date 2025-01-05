"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSectionFanfic } from "@/db/fanfics";
import { Tag, TagsIcon, X } from "lucide-react";
import type React from "react";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export default function InputLabels({
  sectionId,
  fanficId,
  labels,
}: {
  sectionId: number;
  fanficId: number;
  labels: string[];
}) {
  const [newLabel, setNewLabel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(
    labels,
    (_: string[], updatedLabels: string[]) => updatedLabels
  );

  const currentLabels = isPending ? optimistic : labels;

  const handleAddLabel = () => {
    setNewLabel("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleUpdateLabels = (action: {
    actionType: "add" | "delete";
    label: string | null;
  }) => {
    const cleanLabel = action.label?.trim();
    if (cleanLabel?.trim()) {
      startTransition(async () => {
        let newLabels: string[] = currentLabels;
        const isLabelInCurrentLabels = currentLabels.includes(cleanLabel);
        if (action.actionType === "add" && !isLabelInCurrentLabels) {
          newLabels = [cleanLabel, ...currentLabels];
        } else if (action.actionType === "delete" && isLabelInCurrentLabels) {
          newLabels = currentLabels.filter((label) => label !== cleanLabel);
        }
        if (newLabels !== currentLabels) {
          addOptimistic(newLabels);
          await updateSectionFanfic(sectionId, fanficId, {
            editableLabels: newLabels,
          });
        }
      });
    } else {
      handleCancelLabel();
    }
    setNewLabel(null);
  };

  const handleCancelLabel = () => {
    setNewLabel(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUpdateLabels({
        actionType: "add",
        label: (e.target as HTMLInputElement).value,
      });
    } else if (e.key === "Escape") {
      handleCancelLabel();
    }
  };

  return (
    <div className="max-w-md px-1 flex flex-row items-center gap-2">
      {newLabel === null && (
        <Button size="sm" variant="ghost" onClick={handleAddLabel}>
          <TagsIcon /> Add Label
        </Button>
      )}
      <div className="flex flex-row w-fit items-center gap-1">
        {newLabel !== null && (
          <Badge variant="outline" className="w-fit">
            <Input
              noborder
              autoFocus
              className={cn(
                "text-xs text-muted-foreground px-1 py-0 placeholder:text-gray-400 placeholder:truncate transition-all",
                "w-auto min-w-[60px] max-w-[200px]"
              )}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() =>
                handleUpdateLabels({ actionType: "add", label: newLabel })
              }
              placeholder="Enter label"
            />
          </Badge>
        )}
        <div className="max-w-full flex flex-wrap gap-2">
          {currentLabels.map((label, index) => (
            <Badge
              key={index}
              variant="outline"
              className="relative w-fit flex items-center pr-6"
            >
              {label}
              <Button
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/3 p-0 h-4 w-4"
                onClick={() =>
                  handleUpdateLabels({ actionType: "delete", label })
                }
              >
                ˣ
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
