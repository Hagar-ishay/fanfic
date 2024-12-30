"use client";

import React, { useState, useRef, useTransition, useOptimistic } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";
import { updateSectionFanfic } from "@/db/fanfics";

export default function InputLabels({
  fanficId,
  labels,
}: {
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
          await updateSectionFanfic(fanficId, { editableLabels: newLabels });
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
          <Tag />
        </Button>
      )}
      <div className="flex flex-row w-fit items-center gap-1">
        {newLabel !== null && (
          <Badge variant="outline" className="w-fit">
            <Input
              noborder
              className="text-xs px-1 py-0 placeholder:text-gray-400 placeholder:truncate"
              size={5}
              ref={inputRef}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() =>
                handleUpdateLabels({ actionType: "add", label: newLabel })
              }
              placeholder="Add tag"
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
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0 h-4 w-4"
                onClick={() =>
                  handleUpdateLabels({ actionType: "delete", label })
                }
              >
                <X />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
