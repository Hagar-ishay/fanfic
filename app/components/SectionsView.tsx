import FanficCard from "@/components/FanficCard";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { loader } from "@/routes/_index";
import type { action } from "@/routes/api.sections.$sectionId.fanfics.$fanficId";
import { useSectionsStore } from "@/store";
import {
	DragDropContext,
	Draggable,
	type DropResult,
	Droppable,
} from "@hello-pangea/dnd";
import { useFetcher } from "@remix-run/react";
import { matchSorter } from "match-sorter";
import { useTypedLoaderData } from "remix-typedjson";

export default function SectionsView({ searchInput }: { searchInput: string }) {
	const { fanfics, sections } = useTypedLoaderData<typeof loader>();
	const updateFetcher = useFetcher<typeof action>();
	const openSections = useSectionsStore((state) => state.openSections);
	const setOpenSections = useSectionsStore((state) => state.setOpenSections);

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const { source, destination } = result;

		if (source.droppableId !== destination.droppableId) {
			const fanficId = result.draggableId;
			const newSectionId = +destination.droppableId;
			const oldSectionId = source.droppableId;

			updateFetcher.submit(
				{ newSectionId, fanficId },
				{
					method: "PATCH",
					action: `/api/sections/${oldSectionId}/fanfics/${fanficId}`,
				},
			);
		}
	};

	const onTranfserSection = (
		newSectionId: number,
		fanficId: number,
		oldSectionId: number,
	) => {
		updateFetcher.submit(
			{ newSectionId, fanficId, oldSectionId },
			{
				method: "PATCH",
				action: `/api/sections/${oldSectionId}/fanfics/${fanficId}`,
			},
		);
	};

	const sectionFanfics = (sectionId: number) => {
		let updatedFics = fanfics;

		if (updateFetcher.state !== "idle" && updateFetcher.formData) {
			const newSectionId = Number(updateFetcher.formData.get("newSectionId"));
			const fanficId = Number(updateFetcher.formData.get("fanficId"));

			updatedFics = fanfics.map((fanfic) => {
				if (fanfic.id === fanficId) {
					return {
						...fanfic,
						sectionId: newSectionId,
					};
				}
				return fanfic;
			});
		}

		const filteredFanfics = updatedFics.filter(
			(fanfic) => fanfic.sectionId === sectionId,
		);

		return matchSorter(filteredFanfics, searchInput, {
			keys: ["title", "author", "tags.FANDOM", "tags.RELATIONSHIPS"],
		});
	};

	const orderedSections = sections.sort((section, nextSection) =>
		section.id < nextSection.id ? -1 : 1,
	);

	return (
		<DragDropContext onDragEnd={handleDragEnd} enableDefaultSensors={true}>
			<Accordion
				type="multiple"
				className="w-full p-1"
				value={openSections}
				onValueChange={(value) => setOpenSections(value)}
			>
				{orderedSections.map((section) => (
					<Droppable key={section.id} droppableId={section.id.toString()}>
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								<AccordionItem value={section.name} className="p-2">
									<AccordionTrigger className="w-full p-4 bg-secondary rounded-md">
										<h2 className="text-xl font-bold text-secondary-foreground">{`${section.name} (${sectionFanfics(section.id).length})`}</h2>
									</AccordionTrigger>
									<AccordionContent className="p-4 bg-primary-foreground border-t">
										<div className={cn("flex flex-col gap-4")}>
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
															{...provided.dragHandleProps}
														>
															<FanficCard
																fanfic={fanfic}
																sectionId={section.id}
																isDragging={snapshot.isDragging}
																onTranfserSection={onTranfserSection}
																transferableSections={sections.filter(
																	(transferSection) =>
																		transferSection.id !== section.id,
																)}
															/>
														</div>
													)}
												</Draggable>
											))}
										</div>
									</AccordionContent>
								</AccordionItem>
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				))}
			</Accordion>
		</DragDropContext>
	);
}
