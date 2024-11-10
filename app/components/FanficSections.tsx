import FanficCard from "@/components/FanficCard";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/Accordion";
import { useSectionsStore } from "@/store";

export function FanficSections() {
	const sections = useSectionsStore((state) => state.sections);
	const setOpenedSections = useSectionsStore(
		(state) => state.setOpenedSections,
	);
	const openedSections = sections
		.filter((section) => section.isOpen)
		.map((section) => section.id);
	return (
		<Accordion
			type="multiple"
			className="w-full p-1"
			value={openedSections}
			onValueChange={setOpenedSections}
		>
			{sections.map((section) => (
				<AccordionItem key={section.id} value={section.id} className="p-2">
					<AccordionTrigger className="w-full p-4 bg-secondary rounded-md">
						<h2 className="text-xl font-bold text-secondary-foreground">{`${section.name} (${section.fanfics.length})`}</h2>
					</AccordionTrigger>
					<AccordionContent className="p-4 bg-primary-foreground border-t">
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
			))}
		</Accordion>
	);
}
