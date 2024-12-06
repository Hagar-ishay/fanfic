"use client";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tags } from "@/db/types";
import { cn } from "@/lib/utils";
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

const MAX_TAGS_ITEM_LENGTH = 50;

type BadgeItem = {
  category: string;
  value: string;
};

type BadgeGroup = {
  badges: BadgeItem[];
  totalLength: number;
};

export default function TagsCarousel({ tags }: { tags: Tags }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const badges: BadgeItem[] = Object.entries(tags).flatMap(
    ([category, values]) =>
      (values as string[]).map((value) => ({ category, value }))
  );

  const badgeGroups: BadgeGroup[] = badges.reduce(
    (groups: BadgeGroup[], badge: BadgeItem) => {
      const badgeLength = badge.value.length;

      let currentGroup = groups[groups.length - 1];

      if (
        !currentGroup ||
        currentGroup.totalLength + badgeLength > MAX_TAGS_ITEM_LENGTH ||
        currentGroup.badges.length > 2
      ) {
        groups.push({ badges: [badge], totalLength: badgeLength });
      } else {
        currentGroup.badges.push(badge);
        currentGroup.totalLength += badgeLength;
      }

      return groups;
    },
    []
  );

  return (
    <Carousel>
      <CarouselContent>
        {badgeGroups.map((group, index) => (
          <CarouselItem className="flex justify-center" key={index}>
            <div className="flex flex-row flex-wrap gap-3">
              {group.badges.map(({ category, value }) => (
                <Badge
                  className="w-fit"
                  key={value}
                  title={category.toLowerCase().replace("_", " ")}
                >
                  {value}
                </Badge>
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        variant="ghost"
        className={cn(isDesktop ? "ml-8" : "")}
      />
      <CarouselNext variant="ghost" className={cn(isDesktop ? "mr-8" : "")} />
    </Carousel>
  );
}
