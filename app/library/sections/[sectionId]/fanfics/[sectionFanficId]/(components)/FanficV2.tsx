"use client";

import { BlockQuote } from "@/components/base/BlockQuote";
import { ContextMenu, Option } from "@/components/base/ContextMenu";
import Tags from "@/components/base/Tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section, UserFanfic } from "@/db/types";
import { formatDate, getIsDesktop } from "@/lib/utils";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import { SummaryContent } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Summary";
import { Ellipsis, EllipsisVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FanficStats } from "./FanficStats";

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
          <BlockQuote>
            <SummaryContent summary={fanfic.summary} />
          </BlockQuote>
        </div>
      )}

      {/* Personal Labels Section - Moved up */}
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

      <FanficStats fanfic={fanfic} />
      <Tags tags={fanfic.tags} />
    </div>
  );
}
