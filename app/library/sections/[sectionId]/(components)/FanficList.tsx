"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import FanficCard from "./FanficCard";
import { reorderFanfics } from "@/db/fanfics";
import { Section, UserFanfic } from "@/db/types";
import { useOptimistic, useTransition } from "react";

type FanficListProps = {
  fanfics: UserFanfic[];
  sectionId: number;
  transferableSections: Section[];
};

export default function FanficList({ fanfics, sectionId, transferableSections }: FanficListProps) {
  const [, startTransition] = useTransition();
  const [optimisticFics, setOptimistic] = useOptimistic(
    fanfics,
    (oldFanfics, { fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
      const newFanfics = [...oldFanfics];
      const [movedFanfic] = newFanfics.splice(fromIndex, 1);
      newFanfics.splice(toIndex, 0, movedFanfic);
      return newFanfics;
    }
  );

  return (
    <DragDropContext
      onDragEnd={async (result) => {
        if (!result.destination) return;
        const fromIndex = result.source.index;
        const toIndex = result.destination.index;
        startTransition(async () => {
          setOptimistic({ fromIndex, toIndex });
          await reorderFanfics(sectionId, fromIndex, toIndex);
        });
      }}
    >
      <Droppable droppableId={`section-${sectionId}`}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {optimisticFics.map((fanfic, index) => (
              <FanficCard transferableSections={transferableSections} key={fanfic.id} fanfic={fanfic} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
