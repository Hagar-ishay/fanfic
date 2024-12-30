"use client";
import type { Fanfic, Section } from "@/db/types";
import { useSearchStore, useSectionsStore } from "@/store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { matchSorter } from "match-sorter";
import { updateFic } from "@/server/updater";
import { useOptimistic, useTransition } from "react";
import { Grip } from "lucide-react";
import FanficView from "@/components/main-page/FanficView";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { checkForUpdates } from "@/server/checkForUpdates";

export default function SectionsView({
  fanfics,
  sections,
}: {
  fanfics: Fanfic[];
  sections: Section[];
}) {
  const { toast } = useToast();
  const openSections = useSectionsStore((state) => state.openSections);
  const setOpenSections = useSectionsStore((state) => state.setOpenSections);
  const searchInput = useSearchStore((state) => state.searchInput);
  const [isPending, startTransition] = useTransition();
  const [optimisticFanfics, addOptimistic] = useOptimistic(
    fanfics,
    (
      fanficsState: Fanfic[],
      action: { newSectionId: number; fanficId: number }
    ) =>
      fanficsState.map((fanficState) =>
        fanficState.id === action.fanficId
          ? { ...fanficState, sectionId: action.newSectionId }
          : fanficState
      )
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const result = await checkForUpdates(fanfics);
      if (!result.success) {
        toast({
          title: "Check for updates",
          description: `Failed to update: ${result.message}`,
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const fanficId = +result.draggableId;
      const newSectionId = +destination.droppableId;
      startTransition(async () => {
        addOptimistic({ newSectionId, fanficId });
        await updateFic(fanficId, { sectionId: newSectionId });
      });
    }
  };

  const sectionFanfics = (sectionId: number) => {
    const fics = isPending ? optimisticFanfics : fanfics;
    const filteredFanfics = fics.filter(
      (fanfic) => fanfic.sectionId === sectionId
    );

    return matchSorter(filteredFanfics, searchInput, {
      keys: [
        "title",
        "author",
        "tags.FANDOM",
        "tags.RELATIONSHIPS",
        "editableLabels",
      ],
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} enableDefaultSensors={true}>
      <Accordion
        className="relative max-h-screen overflow-auto"
        type="multiple"
        value={openSections}
        onValueChange={(value: string[]) => setOpenSections(value)}
      >
        {sections.map((section) => (
          <Droppable key={section.id} droppableId={section.id.toString()}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <AccordionItem value={section.name}>
                  <AccordionTrigger className="p-4 sticky top-0 bg-white z-10 shadow-md">
                    <h2 className="text-secondary-foreground">{`${section.name} (${sectionFanfics(section.id).length})`}</h2>
                  </AccordionTrigger>
                  <AccordionContent className="p-4">
                    {sectionFanfics(section.id)?.map((fanfic, index) => (
                      <Draggable
                        key={fanfic.id}
                        draggableId={fanfic.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center"
                          >
                            <div className="w-full min-w-0">
                              <FanficView
                                fanfic={fanfic}
                                isDragging={snapshot.isDragging}
                                transferableSections={sections.filter(
                                  (transferSection) =>
                                    transferSection.id !== section.id
                                )}
                              />
                            </div>
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-2"
                            >
                              <Grip className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </AccordionContent>
                </AccordionItem>
              </div>
            )}
          </Droppable>
        ))}
      </Accordion>
    </DragDropContext>
  );
}
