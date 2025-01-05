"use client";

import { Tooltip } from "@/components/base/Tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

import { Tags as TagsType } from "@/db/types";
import { capitalize } from "@/lib/utils";

type BadgeItem = {
  category: string;
  value: string;
};

export default function Tags({ tags }: { tags: TagsType }) {
  const badges: BadgeItem[] = Object.entries(tags).flatMap(
    ([category, values]) =>
      (values as string[]).map((value) => ({ category, value }))
  );

  const mainTags = {
    Fandom: tags.FANDOM || [],
    Rating: tags.RATING || [],
    Category: tags.CATEGORY || [],
    Relationships: tags.RELATIONSHIP || [],
  };

  const additionalTags = badges.filter(
    (badge) => !Object.values(mainTags).flat().includes(badge.value)
  );

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="tags">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {Object.entries(mainTags).map(([category, values]) =>
                values.map((value, idx) => (
                  <Tooltip description={category} key={idx}>
                    <Badge variant="secondary">{value}</Badge>
                  </Tooltip>
                ))
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {additionalTags.map((badge, index) => (
                <Tooltip description={capitalize(badge.category)} key={index}>
                  <Badge key={index} variant="secondary">
                    {badge.value}
                  </Badge>
                </Tooltip>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
