"use client";

import { BlockQuote } from "@/components/base/BlockQuote";
import { ContextMenu, Option } from "@/components/base/ContextMenu";
import Tags from "@/components/base/Tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Section, UserFanfic } from "@/db/types";
import { getIsDesktop } from "@/lib/utils";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import {
  Ellipsis,
  EllipsisVertical,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export default function FanficV2({
  fanfic,
  transferableSections,
}: {
  fanfic: UserFanfic;
  transferableSections: Section[];
}) {
  const isDesktop = getIsDesktop();
  const [editingLabels, setEditingLabels] = useState(false);
  const [labels, setLabels] = useState<string[]>(fanfic.editableLabels || []);

  const criticalTags = {
    Fandom: fanfic.tags.FANDOM || [],
    Rating: fanfic.tags.RATING || [],
    Category: fanfic.tags.CATEGORY || [],
    Relationships: fanfic.tags.RELATIONSHIP || [],
  };

  console.log({ criticalTags });

  return (
    <div className="flex flex-col gap-6 p-4 max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{fanfic.title}</h1>
            <Link href={fanfic.sourceUrl} target="_blank">
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>by {fanfic.author}</span>
            {fanfic.authorUrl && (
              <Link href={fanfic.authorUrl} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        <FanficContextMenu
          fanfic={fanfic}
          sections={transferableSections}
          trigger={
            <Button size="icon" variant="ghost" className="">
              {isDesktop ? <Ellipsis /> : <EllipsisVertical />}
            </Button>
          }
        />
      </div>
      {/* Summary Section */}
      {fanfic.summary && (
        <div className="max-h-40 overflow-y-auto">
          <BlockQuote>{fanfic.summary}</BlockQuote>
        </div>
      )}
      {/* Critical Tags Section */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(criticalTags).map(([category, values]) =>
          values.map((value, idx) => (
            <Badge key={`${category}-${idx}`} variant="secondary">
              {value}
            </Badge>
          ))
        )}
      </div>
      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>Created: {formatDate(fanfic.createdAt)}</div>
        <div>Updated: {formatDate(fanfic.updatedAt)}</div>
        <div>Completed: {formatDate(fanfic.completedAt)}</div>
        <div>Words: {fanfic.wordCount?.toLocaleString()}</div>
        <div>Chapters: {fanfic.chapterCount}</div>
        <div>Language: {fanfic.language}</div>
      </div>
      {/* Personal Stats Section */}
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Reading Progress</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Last Sent: {formatDate(fanfic.lastSent)}</div>
          {fanfic.latestStartingChapter && (
            <div>New Chapters Available: {fanfic.latestStartingChapter}</div>
          )}
        </div>
      </div>
      {/* Additional Tags Section */}
      <Tags tags={fanfic.tags} />
      {/* Editable Labels Section */}
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Personal Labels</h3>
        {editingLabels ? (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Add label and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value && !labels.includes(value)) {
                    setLabels([...labels, value]);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {labels.map((label, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setLabels(labels.filter((_, i) => i !== idx))}
                >
                  {label} ×
                </Badge>
              ))}
            </div>
            <Button variant="outline" onClick={() => setEditingLabels(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {labels.map((label, idx) => (
              <Badge key={idx} variant="outline">
                {label}
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingLabels(true)}
            >
              Edit Labels
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
