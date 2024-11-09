import React from "react";
import { useDrop } from "react-dnd";
import type { Section } from "@/types";
import FanficCard from "@/components/FanficCard";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";

interface Props {
	section: Section;
	moveFanfic: (
		fanficId: string,
		sourceSectionId: string,
		targetSectionId: string,
	) => void;
}

export function FanficSection({ section, moveFanfic }: Props) {
	const [, drop] = useDrop({
		accept: "FANFIC",
		drop: (item: { fanficId: string; sourceSectionId: string }) => {
			if (item.sourceSectionId !== section.id) {
				moveFanfic(item.fanficId, item.sourceSectionId, section.id);
			}
		},
	});
	console.log({ section });
	return (
		<Accordion type="single" collapsible className="w-full p-1">
			<AccordionItem value={section.id}>
				<AccordionTrigger
					ref={drop}
					className="w-full p-4 bg-zinc-100 hover:bg-zinc-200 transition-colors duration-200 rounded-md"
				>
					<h2 className="text-xl font-bold text-zinc-900">{section.name}</h2>
				</AccordionTrigger>
				<AccordionContent className="p-4 bg-white border-t border-zinc-200">
					<div className="flex flex-col gap-4">
						{section.fanfics.map((fanfic) => (
							<FanficCard
								key={fanfic.id}
								fanfic={fanfic}
								sectionId={section.id}
							/>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
