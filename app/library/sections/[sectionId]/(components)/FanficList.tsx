"use client";

import { reorderFanfics } from "@/db/fanfics";
import type { Fanfic, SectionFanfic } from "@/db/types";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import FanficCard from "./FanficCard";

type FanficListProps = {
  fanfics: {
    fanfics: Fanfic;
    section_fanfics: SectionFanfic;
  }[];
  sectionId: number;
};

export default function FanficList({
  fanfics: initialFanfics,
  sectionId,
}: FanficListProps) {
  const [fanfics, setFanfics] = useState(initialFanfics);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const newFanfics = Array.from(fanfics);
    const [removed] = newFanfics.splice(source.index, 1);
    newFanfics.splice(destination.index, 0, removed);

    setFanfics(newFanfics);
    await reorderFanfics(sectionId, source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`section-${sectionId.toString()}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "space-y-2 min-h-[100px]",
              snapshot.isDraggingOver && "bg-accent/10"
            )}
          >
            {fanfics.map((fanfic, index) => (
              <FanficCard
                key={fanfic.section_fanfics.id}
                fanfic={{
                  ...fanfic.fanfics,
                  ...fanfic.section_fanfics,
                  id: fanfic.section_fanfics.id,
                }}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
