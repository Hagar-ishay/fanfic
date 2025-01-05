"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import FanficCard from "./FanficCard";
import { reorderFanfics } from "@/db/fanfics";
import { Section } from "@/db/types";

type FanficListProps = {
  fanfics: any[];
  sectionId: number;
  transferableSections: Section[];
};

export default function FanficList({ fanfics, sectionId, transferableSections }: FanficListProps) {
  return (
    <DragDropContext
      onDragEnd={async (result) => {
        if (!result.destination) return;
        const fromIndex = result.source.index;
        const toIndex = result.destination.index;

        await reorderFanfics(sectionId, fromIndex, toIndex);
      }}
    >
      <Droppable droppableId={`section-${sectionId}`}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {fanfics.map((fanfic, index) => (
              <FanficCard
              transferableSections={transferableSections}
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
