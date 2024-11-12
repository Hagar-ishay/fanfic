import SectionsView from "@/components/SectionsView";
import { SettingsModal } from "@/components/Settings";
import { Button } from "@/components/ui/Button";
import * as consts from "@/consts";
import type { Fanfic } from "@/db/types";
import { isMobileDevice } from "@/lib/utils";
import { getFanfic } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { useSectionsStore } from "@/store";
import { type SerializeFrom, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { DateTime } from "luxon";
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
	const fetcher = useFetcher<typeof loader>();

	useEffect(() => {
		const chosenBackend = isMobileDevice() ? TouchBackend : HTML5Backend;
		setBackend(() => chosenBackend);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fanfic = fetcher.data;
		if (fanfic) {
			setFanficInSection(fanfic, consts.DEFAULT_SECTIONS.READING);
		}
	}, [fetcher, setFanficInSection]);

	const handleAddFanficFromClipboard = async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (clipboardText.startsWith(`${consts.AO3_LINK}/works/`)) {
				fetcher.submit(`?fanficUrl=${encodeURIComponent(clipboardText)}`);
			} else {
				alert("Invalid URL. Please copy a valid AO3 fanfic URL.");
			}
		} catch (error) {
			console.error("Failed to read from clipboard: ", error);
		}
	};

	return (
		<DndProvider backend={backend}>
			<div className="flex items-center p-4 justify-end gap-2">
				<Button
					type="submit"
					className="ml-4"
					onClick={handleAddFanficFromClipboard}
				>
					Add From Clipboard
				</Button>
				<SettingsModal />
			</div>
			<SectionsView />
		</DndProvider>
	);
}

export default MainPage;
