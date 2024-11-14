import FanficCard from "@/components/FanficCard";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/Accordion";
import type { Fanfic, Section } from "@/db/types";
import { parseFanfic } from "@/lib/utils";
import type { loader } from "@/routes/api.sections.$sectionId.fanfics";
import type { action } from "@/routes/api.sections.$sectionId.fanfics.$fanficId";
import { Draggable } from "@hello-pangea/dnd";
import { useFetcher } from "@remix-run/react";
import React from "react";

export default function FanficSection({
	section,
	fanfics,
}: {
	section: Section;
	fanfics: Fanfic[];
}) {
	return (
		<AccordionItem value={section.name} className="p-2">
			<AccordionTrigger className="w-full p-4 bg-secondary rounded-md">
				<h2 className="text-xl font-bold text-secondary-foreground">{`${section.name} (${fanfics?.length || "0"})`}</h2>
			</AccordionTrigger>
			<AccordionContent className="p-4 bg-primary-foreground border-t">
				<div className="flex flex-col gap-4">
					{fanfics?.map((fanfic, index) => (
						<Draggable
							key={fanfic.id}
							draggableId={fanfic.id.toString()}
							index={index}
						>
							{(provided) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
								>
									<FanficCard fanfic={fanfic} sectionId={section.id} />
								</div>
							)}
						</Draggable>
					))}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
