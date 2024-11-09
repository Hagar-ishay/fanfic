import { FanficSection } from "@/components/FanficSection";
import { FanficExtractor } from "@/server/extractor";
import { isMobileDevice } from "@/server/utils";
import type { Section, Fanfic } from "@/types";
import type { BackendFactory } from "dnd-core";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { getFanfic } from "@/server/ao3Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSectionsStore } from "@/store";

export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url);
	const fanficUrl = url.searchParams.get("fanficUrl");

	if (fanficUrl) {
		const data = await getFanfic(fanficUrl);

		const metadata = await FanficExtractor(data, fanficUrl);

		return json({ metadata });
	}

	return json({ metadata: null });
}

function MainPage() {
	const { metadata } = useLoaderData<{ metadata: Fanfic | null }>();
	const fetcher = useFetcher();
	const [newFanficUrl, setNewFanficUrl] = useState("");
	const [backend, setBackend] = useState<BackendFactory>(() => HTML5Backend);
	const sections = useSectionsStore((state) => state.sections);
	const setSections = useSectionsStore((state) => state.setSections);

	React.useEffect(() => {
		const chosenBackend = isMobileDevice() ? TouchBackend : HTML5Backend;
		setBackend(() => chosenBackend);
	}, []);

	React.useEffect(() => {
		if (metadata) {
			console.log("AO3 Metadata:", JSON.stringify(metadata, null, 2));
		}
	}, [metadata]);

	const moveFanfic = (
		fanficId: string,
		sourceSectionId: string,
		targetSectionId: string,
	) => {
		setSections((prevSections) => {
			const sourceSection = prevSections.find((s) => s.id === sourceSectionId)!;
			const fanfic = sourceSection.fanfics.find((f) => f.id === fanficId)!;

			sourceSection.fanfics = sourceSection.fanfics.filter(
				(f) => f.id !== fanficId,
			);

			const targetSection = prevSections.find((s) => s.id === targetSectionId)!;
			targetSection.fanfics = [fanfic, ...targetSection.fanfics];

			return [...prevSections];
		});
	};

	const handleAddFanfic = (e: React.FormEvent) => {
		e.preventDefault();
		if (newFanficUrl.trim()) {
			fetcher.load(`?fanficUrl=${encodeURIComponent(newFanficUrl)}`);
			setNewFanficUrl("");
		}
	};

	return (
		<DndProvider backend={backend}>
			{/* Top-Level Bar for Adding Fanfic URL */}
			<div className="flex items-center p-4">
				<Form
					method="get"
					onSubmit={handleAddFanfic}
					className="flex items-center"
				>
					<Input
						type="text"
						className="flex-1 p-2 border rounded mr-2"
						placeholder="Enter URL"
						value={newFanficUrl}
						onChange={(e) => setNewFanficUrl(e.target.value)}
					/>
					<Button type="submit" className="btn ml-4">
						Add
					</Button>
				</Form>
				<Button className="btn ml-4">Configure Kindle Email Address</Button>
			</div>

			{/* Sections */}
			{sections.map((section) => (
				<FanficSection
					key={section.id}
					section={section}
					moveFanfic={moveFanfic}
				/>
			))}
		</DndProvider>
	);
}

export default MainPage;
