"use client";

import { reorderFanfics } from "@/db/fanfics";
import type { Fanfic, SectionFanfic } from "@/db/types";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import FanficCard from "./FanficCard";

type FanficListProps = {
  fanfics: {
    fanfics: Fanfic;
    section_fanfics: SectionFanfic;
  }[];
  sectionId: number;
};

export default function FanficList({ fanfics, sectionId }: FanficListProps) {

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
