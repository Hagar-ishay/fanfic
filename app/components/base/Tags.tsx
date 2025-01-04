"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

import { Tags as TagsType } from "@/db/types";

type BadgeItem = {
  category: string;
  value: string;
};

export default function Tags({ tags }: { tags: TagsType }) {
  const badges: BadgeItem[] = Object.entries(tags).flatMap(
    ([category, values]) =>
      (values as string[]).map((value) => ({ category, value }))
  );

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="tags">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Additional Tags</span>
            <Badge variant="secondary">{badges.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-row gap-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant="default">
                {badge.value}
              </Badge>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
