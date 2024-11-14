import FanficCard from "@/components/FanficCard";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/Accordion";
import { parseFanfic } from "@/lib/utils";
import type { loader as fanficLoader } from "@/routes/api.fanfics";
import type { loader as sectionLoader } from "@/routes/api.sections";
import type { action } from "@/routes/api.sections.$sectionId.fanfics.$fanficId";
import { useSectionsStore } from "@/store";
import {
	DragDropContext,
	Draggable,
	type DropResult,
	Droppable,
} from "@hello-pangea/dnd";
import { useFetcher } from "@remix-run/react";
import React from "react";

export default function SectionsView({
	reloadTrigger,
}: { reloadTrigger: number }) {
	const sectionFetcher = useFetcher<typeof sectionLoader>();
	const fanficFetcher = useFetcher<typeof fanficLoader>();
	const updateFetcher = useFetcher<typeof action>();
	const openSections = useSectionsStore((state) => state.openSections);
	const setOpenSections = useSectionsStore((state) => state.setOpenSections);

	const fanfics =
		fanficFetcher.data?.fanfics?.map((fanfic) => parseFanfic(fanfic)) || [];

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		if (fanficFetcher.state === "idle") {
			fanficFetcher.load("/api/fanfics");
		}
	}, [reloadTrigger]);

	const sections = sectionFetcher.data?.sections?.map((section) => ({
		...section,
		creationTime: new Date(section.creationTime),
		updateTime: section.updateTime ? new Date(section.updateTime) : null,
	}));

	if (sectionFetcher.state === "idle" && sectionFetcher.data == null) {
		sectionFetcher.load("/api/sections");
	}

	if (sectionFetcher.state === "idle" && sectionFetcher.data == null) {
		sectionFetcher.load("/api/sections");
	}

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

		return updatedFics.filter((fanfic) => fanfic.sectionId === sectionId);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Accordion
				type="multiple"
				className="w-full p-1"
				value={openSections}
				onValueChange={(value) => setOpenSections(value)}
			>
				{sections?.map((section) => (
					<Droppable key={section.id} droppableId={section.id.toString()}>
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								<AccordionItem value={section.name} className="p-2">
									<AccordionTrigger className="w-full p-4 bg-secondary rounded-md">
										<h2 className="text-xl font-bold text-secondary-foreground">{`${section.name} (${sectionFanfics(section.id).length})`}</h2>
									</AccordionTrigger>
									<AccordionContent className="p-4 bg-primary-foreground border-t">
										<div className="flex flex-col gap-4">
											{sectionFanfics(section.id)?.map((fanfic, index) => (
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
															<FanficCard
																fanfic={fanfic}
																sectionId={section.id}
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
