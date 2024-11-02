// src/components/FanficCard.tsx

import React, { useState } from "react";
import { useDrag } from "react-dnd";
import Modal from "react-modal";
import { Fanfic } from "../types";

interface Props {
	fanfic: Fanfic;
	sectionId: string;
}

const FanficCard: React.FC<Props> = ({ fanfic, sectionId }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const [{ isDragging }, drag] = useDrag({
		type: "FANFIC",
		item: { fanficId: fanfic.id, sourceSectionId: sectionId },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleOpenModal = () => {
		// Open modal with fanfic details
	};

	const handleUpdate = () => {
		// Check for updates and update fanfic.hasUpdate
	};

	const handleSendToKindle = () => {
		// Send the fanfic to the configured Kindle email
	};

	return (
		<div
			ref={drag}
			className={`p-2 my-2 bg-white shadow-md rounded ${isDragging ? "opacity-50" : "opacity-100"}`}
		>
			<div onClick={handleOpenModal}>
				<h3 className="font-bold">{fanfic.title}</h3>
				<p>By {fanfic.author}</p>
			</div>
			<div className="flex justify-end mt-2">
				<button
					className={`btn mr-2 ${fanfic.hasUpdate ? "" : "opacity-50 cursor-not-allowed"}`}
					onClick={handleUpdate}
					disabled={!fanfic.hasUpdate}
				>
					Update
				</button>
				<button className="btn" onClick={handleSendToKindle}>
					Send to Kindle
				</button>
			</div>
			<Modal
				isOpen={isModalOpen}
				onRequestClose={() => setIsModalOpen(false)}
				contentLabel="Fanfic Details"
				ariaHideApp={false}
			>
				<h2>{fanfic.title}</h2>
				<p>By {fanfic.author}</p>
				<p>{fanfic.summary}</p>
				<button onClick={() => setIsModalOpen(false)}>Close</button>
			</Modal>
		</div>
	);
};

export default FanficCard;
