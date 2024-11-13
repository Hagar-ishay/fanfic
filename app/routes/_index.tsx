import SectionsView from "@/components/SectionsView";
import { SettingsModal } from "@/components/Settings";
import { Button } from "@/components/ui/Button";
import * as consts from "@/consts";
import { isMobileDevice, parseFanfic } from "@/lib/utils";
import { getFanfic } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
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
	const [backend, setBackend] = useState(() => HTML5Backend);
	const fetcher = useFetcher<typeof loader>();

	useEffect(() => {
		const chosenBackend = isMobileDevice() ? TouchBackend : HTML5Backend;
		setBackend(() => chosenBackend);
	}, []);

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			fetcher.submit(
				{
					fanfic: JSON.stringify(parseFanfic(fetcher.data)),
				},
				{
					method: "POST",
					action: "/api/sections/1/fanfics",
				},
			);
		}
	}, [fetcher.data, fetcher.state, fetcher.submit]);

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
