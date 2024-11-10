import { FanficSections } from "@/components/FanficSections";
import { Button } from "@/components/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as consts from "@/consts";
import { getFanfic } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { isMobileDevice } from "@/server/utils";
import { useSectionsStore } from "@/store";
import type { Fanfic } from "@/types";
import { type SerializeFrom, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Settings } from "lucide-react";
import { DateTime } from "luxon";
import React from "react";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url);
	const fanficUrl = url.searchParams.get("fanficUrl");

	if (fanficUrl) {
		const fanficId =
			fanficUrl
				.toString()
				.replace(`${consts.AO3_LINK}/works/`, "")
				.split("/")[0] ?? "";
		const data = await getFanfic(fanficId);
		const metadata = await fanficExtractor(data, fanficId);
		return json(metadata);
	}

	return json(null);
}

function MainPage() {
	const setFanficInSection = useSectionsStore(
		(state) => state.setFanficInSection,
	);
	const [backend, setBackend] = useState(() => HTML5Backend);
	const [newFanficUrl, setNewFanficUrl] = React.useState("");
	const fetcher = useFetcher<typeof loader>();

	function parseFanfic(
		data: SerializeFrom<typeof loader> | undefined,
	): Fanfic | null {
		const fetchDate = (date: string | null | undefined): DateTime | null => {
			return date ? DateTime.fromISO(date) : null;
		};

		if (data) {
			return {
				...data,
				createdAt: fetchDate(data.createdAt),
				updatedAt: fetchDate(data.updatedAt),
				completedAt: fetchDate(data.completedAt),
				downloadedAt: fetchDate(data.downloadedAt),
			};
		}
		return null;
	}

	useEffect(() => {
		const chosenBackend = isMobileDevice() ? TouchBackend : HTML5Backend;
		setBackend(() => chosenBackend);
	}, []);

	useEffect(() => {
		const fanfic = parseFanfic(fetcher.data);
		if (fanfic) {
			const sectonId = fanfic.completedAt
				? consts.DEFAULT_SECTIONS.COMPLETED
				: consts.DEFAULT_SECTIONS.READING;
			setFanficInSection(fanfic, sectonId);
		}
	}, [fetcher, setFanficInSection]);

	const handleAddFanficFromClipboard = async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (clipboardText.startsWith(`${consts.AO3_LINK}/works/`)) {
				setNewFanficUrl(clipboardText);
				fetcher.submit(`?fanficUrl=${encodeURIComponent(clipboardText)}`);
				setNewFanficUrl("");
			} else {
				alert("Invalid URL. Please copy a valid AO3 fanfic URL.");
			}
		} catch (error) {
			console.error("Failed to read from clipboard: ", error);
		}
	};

	return (
		<DndProvider backend={backend}>
			<div className="flex items-center p-4 justify-end">
				<Button
					type="submit"
					className="ml-4"
					onClick={handleAddFanficFromClipboard}
				>
					Add From Clipboard
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="ml-4">
							<Settings />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="mr-2">
						<DropdownMenuItem>Configure Kindle Email</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<FanficSections />
		</DndProvider>
	);
}

export default MainPage;
