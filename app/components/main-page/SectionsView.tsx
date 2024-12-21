"use client";
import type { UserSection } from "@/db/types";
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
import { updateFic, updateSectionFics } from "@/server/updater";
import { useOptimistic, useTransition } from "react";
import { Grip } from "lucide-react";
import FanficView from "@/components/main-page/FanficView";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { checkForUpdates } from "@/server/checkForUpdates";

export default function SectionsView({
  sections,
}: {
  sections: UserSection[];
}) {
  const { toast } = useToast();

  const openSections = useSectionsStore((state) => state.openSections);
  const setOpenSections = useSectionsStore((state) => state.setOpenSections);
  const searchInput = useSearchStore((state) => state.searchInput);
  const [_, startTransition] = useTransition();
  const [optimisticSections, addOptimistic] = useOptimistic(
    sections,
    (
      sectionsState: UserSection[],
      sectionsToUpdate: {
        sectionId: number;
        sectionFanficId: number;
        position: number;
      }[]
    ) =>
      sectionsState
        .map((sectionState) =>
          sectionsToUpdate.reduce((acc, sectionToUpdate) => {
            if (
              sectionState.section_fanfics.id ===
              sectionToUpdate.sectionFanficId
            ) {
              return {
                ...sectionState,
                section_fanfics: {
                  ...sectionState.section_fanfics,
                  position: sectionToUpdate.position,
                  sectionId: sectionToUpdate.sectionId,
                },
              };
            }
            return acc;
          }, sectionState)
        )
        .sort((a, b) => a.section_fanfics.position - b.section_fanfics.position)
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const result = await checkForUpdates();
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
    const sectionFanficId = +result.draggableId;
    const newSectionId = +destination.droppableId;
    const oldSectionId = +source.droppableId;
    let toUpdate = [];

    return startTransition(async () => {
      const newSectionFanfics = [
        ...optimisticSections
          .filter(
            (section) =>
              section.sections.id === newSectionId &&
              section.section_fanfics.position >= destination.index
          )
          .map((section) => ({
            sectionId: section.section_fanfics.sectionId,
            sectionFanficId: section.section_fanfics.id,
            position: section.section_fanfics.position + 1,
          })),
        {
          sectionId: newSectionId,
          sectionFanficId: sectionFanficId,
          position: destination.index,
        },
      ];

      toUpdate = [...newSectionFanfics];

      if (oldSectionId !== newSectionId) {
        const updatedOldSectionFanfics = optimisticSections
          .filter(
            (section) =>
              section.sections.id === oldSectionId &&
              section.fanfics.id !== sectionFanficId &&
              section.section_fanfics.position >= source.index
          )
          .map((section) => ({
            sectionId: section.section_fanfics.sectionId,
            sectionFanficId: section.section_fanfics.id,
            position: section.section_fanfics.position - 1,
          }));

        toUpdate = [...toUpdate, ...updatedOldSectionFanfics];
      }
      addOptimistic(toUpdate);
      await updateSectionFics(toUpdate);
    });
  };

  const sectionFanfics = (sectionId: number) => {
    const filteredFanfics = optimisticSections
      .filter((section) => section.sections.id === sectionId)
      .sort((a, b) => a.section_fanfics.position - b.section_fanfics.position)
      .map((section) => {
        return {
          ...section.fanfics,
          ...section.section_fanfics,
        };
      });

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
        {optimisticSections.map((userSection) => (
          <Droppable
            key={userSection.sections.id}
            droppableId={userSection.sections.id.toString()}
          >
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <AccordionItem value={userSection.sections.name}>
                  <AccordionTrigger className="p-4 sticky top-0 bg-white z-10 shadow-md">
                    <h2 className="text-secondary-foreground">{`${userSection.sections.name} (${sectionFanfics(userSection.sections.id).length})`}</h2>
                  </AccordionTrigger>
                  <AccordionContent className="p-4">
                    {sectionFanfics(userSection.sections.id)?.map(
                      (sectionFanfic, index) => (
                        <Draggable
                          key={sectionFanfic.id}
                          draggableId={sectionFanfic.id.toString()}
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
                                  fanfic={sectionFanfic}
                                  isDragging={snapshot.isDragging}
                                  transferableSections={optimisticSections
                                    .filter(
                                      (transferSection) =>
                                        transferSection.sections.id !==
                                      userSection.sections.id
                                    )
                                    .map(
                                      (transferSection) =>
                                        transferSection.sections
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
                      )
                    )}
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
