// src/components/MainPage.tsx

import { Fanfic, Section } from "@types";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Modal from "react-modal";
import SectionComponent from "./SectionComponent";

const MainPage: React.FC = () => {
	const [isAddFanficModalOpen, setIsAddFanficModalOpen] = useState(false);
	const [newFanficUrl, setNewFanficUrl] = useState("");
	const [sections, setSections] = useState<Section[]>([
		{ id: "ongoing", name: "Ongoing", fanfics: [] },
		{ id: "completed", name: "Completed", fanfics: [] },
		{ id: "shelved", name: "Shelved", fanfics: [] },
	]);

	const handleAddFanfic = () => {
		// Implement logic to add fanfic by URL
		// For example, fetch fanfic data from the provided URL
	};

	// Function to handle moving fanfics between sections
	const moveFanfic = (
		fanficId: string,
		sourceSectionId: string,
		targetSectionId: string,
	) => {
		setSections((prevSections) => {
			// Remove from source
			const sourceSection = prevSections.find((s) => s.id === sourceSectionId)!;
			const fanfic = sourceSection.fanfics.find((f) => f.id === fanficId)!;
			sourceSection.fanfics = sourceSection.fanfics.filter(
				(f) => f.id !== fanficId,
			);

			// Add to target
			const targetSection = prevSections.find((s) => s.id === targetSectionId)!;
			targetSection.fanfics = [fanfic, ...targetSection.fanfics];

			return [...prevSections];
		});
	};

	return (
		<DndProvider backend={HTML5Backend}>
			{/* Top-Level Buttons */}
			<div className="flex justify-between p-4">
				<button className="btn" /* onClick handler */>Add a Fanfic</button>
				<button className="btn" /* onClick handler */>
					Configure Kindle Email Address
				</button>
			</div>

			{/* Sections */}
			<div className="flex flex-wrap">
				{sections.map((section) => (
					<SectionComponent
						key={section.id}
						section={section}
						moveFanfic={moveFanfic}
					/>
				))}
			</div>
			<button className="btn" onClick={() => setIsAddFanficModalOpen(true)}>
				Add a Fanfic
			</button>
			<Modal
				isOpen={isAddFanficModalOpen}
				onRequestClose={() => setIsAddFanficModalOpen(false)}
				contentLabel="Add a Fanfic"
				ariaHideApp={false}
			>
				<h2>Add a Fanfic</h2>
				<input
					type="text"
					placeholder="Enter fanfic URL"
					value={newFanficUrl}
					onChange={(e) => setNewFanficUrl(e.target.value)}
				/>
				<button onClick={handleAddFanfic}>Add</button>
				<button onClick={() => setIsAddFanficModalOpen(false)}>Cancel</button>
			</Modal>
		</DndProvider>
	);
};

export default MainPage;
