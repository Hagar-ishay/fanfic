"use client";

import {
  DrawerDialog,
  DrawerDialogClose,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { MultiSelect } from "@/components/base/MultiSelect";
import { Button } from "@/components/ui/button";
import { autocomplete } from "@/explore/(server)/autocomplete";
import { useIsMobile } from "@/hooks/use-mobile";
import { AutoCompleteType } from "@/lib/ao3Client";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { PlusIcon } from "lucide-react";

export function SearchBuilder() {
  const isMobile = useIsMobile();

  const getAutoCompleteTags = async (value: string, name: string) => {
    const result = await autocomplete(name, value);
    return result.map((tag) => ({ id: tag, name: tag }));
  };

  const filters = [
    {
      name: "relationship",
      label: "Relationships",
      getOptions: getAutoCompleteTags,
    },
    {
      name: "tag",
      label: "Additional Tags",
      multiple: true,
      getOptions: getAutoCompleteTags,
    },
    {
      name: "fandom",
      label: "Fandoms",
      getOptions: getAutoCompleteTags,
    },
    {
      name: "character",
      label: "Characters",
      getOptions: getAutoCompleteTags,
    },
    {
      name: "rating",
      label: "Ratings",
      paramName: "rating_ids",
      multiple: false,
      getOptions: async () => [
        { id: "10", name: "General Audiences" },
        { id: "11", name: "Teen And Up Audiences" },
        { id: "12", name: "Mature" },
        { id: "13", name: "Explicit" },
      ],
    },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const relationships = JSON.parse(formData.get("relationships") as string);
  };

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>
        <Button>
          <PlusIcon /> Search Builder
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent
        className={cn("flex flex-col", isMobile && "h-full")}
      >
        <form onSubmit={handleSubmit} className="">
          <DrawerDialogHeader>
            <DrawerDialogTitle>Search Builder</DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDialogDescription hidden />
          <ScrollArea className="flex-1">
            <div
              className={cn(
                "flex flex-col gap-4 p-5",
                isMobile ? "h-5/6" : "h-1/2"
              )}
            >
              {filters.map((tag) => (
                <MultiSelect
                  key={tag.name}
                  name={tag.name as AutoCompleteType}
                  label={tag.label}
                  getOptions={tag.getOptions}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="mt-auto">
            <DrawerDialogFooter>
              <DrawerDialogClose asChild>
                <Button type="submit">Create</Button>
              </DrawerDialogClose>
            </DrawerDialogFooter>
          </div>
        </form>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
