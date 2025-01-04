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
import { cn, getIsDesktop } from "@/lib/utils";

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
  const isDesktop = getIsDesktop();

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
    <Carousel
      className={cn("w-full items-center mt-5", !isDesktop ? "pt-3" : "")}
    >
      <CarouselContent>
        {badgeGroups.map((group, index) => (
          <CarouselItem
            className={cn(isDesktop ? "flex justify-center" : "")}
            key={index}
          >
            <div
              className={cn(
                isDesktop
                  ? "flex flex-row flex-wrap gap-3 flex-shrink-0"
                  : "flex gap-3 whitespace-nowrap text-ellipsis overflow-hidden flex-grow min-w-0 justify-center"
              )}
            >
              {group.badges.map(({ category, value }) => (
                <Badge
                  className="inline-block py-2 px-3 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs"
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
        className={cn(isDesktop ? "ml-8" : "ml-6 pt-3 opacity-20")}
      />
      <CarouselNext
        variant="ghost"
        className={cn(isDesktop ? "mr-8" : "mr-6 pt-3  opacity-20")}
      />
    </Carousel>
  );
}
