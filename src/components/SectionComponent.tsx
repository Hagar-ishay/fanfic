// src/components/SectionComponent.tsx

import React from "react";
import { useDrop } from "react-dnd";
import { Section } from "../types";
import FanficCard from "./FanficCard";

interface Props {
	section: Section;
	moveFanfic: (
		fanficId: string,
		sourceSectionId: string,
		targetSectionId: string,
	) => void;
}

const SectionComponent: React.FC<Props> = ({ section, moveFanfic }) => {
	const [, drop] = useDrop({
		accept: "FANFIC",
		drop: (item: any) => {
			if (item.sourceSectionId !== section.id) {
				moveFanfic(item.fanficId, item.sourceSectionId, section.id);
			}
		},
	});

	return (
		<div ref={drop} className="w-full md:w-1/3 p-2">
			<h2 className="text-xl font-bold">{section.name}</h2>
			{section.fanfics.map((fanfic) => (
				<FanficCard key={fanfic.id} fanfic={fanfic} sectionId={section.id} />
			))}
		</div>
	);
};

export default SectionComponent;
