import SectionsView from "@/components/SectionsView";
import { SettingsModal } from "@/components/Settings";
import { Button } from "@/components/ui/Button";
import * as consts from "@/consts";
import { insertFanfic } from "@/db/db";
import { isMobileDevice, parseFanfic } from "@/lib/utils";
import type { action } from "@/routes/api.sections.$sectionId.fanfics";
import { getFanfic } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

function MainPage() {
	const [reloadTrigger, setReloadTrigger] = useState(0);

	const [backend, setBackend] = useState(() => HTML5Backend);
	const fetcher = useFetcher<typeof action>();

	useEffect(() => {
		const chosenBackend = isMobileDevice() ? TouchBackend : HTML5Backend;
		setBackend(() => chosenBackend);
	}, []);

	useEffect(() => {
		if (fetcher.data && !fetcher.data.success) {
			const message = fetcher.data.message;
			if (message?.includes("duplicate key value violates unique constraint")) {
				alert("This fic already exists :)");
			} else {
				alert(`An error occured: ${message}`);
			}
		}
	}, [fetcher.data]);

	useEffect(() => {
		if (fetcher.data?.success) {
			setReloadTrigger((prev) => prev + 1);
		}
	}, [fetcher.data]);

	const handleAddFanficFromClipboard = async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (clipboardText.startsWith(`${consts.AO3_LINK}/works/`)) {
				fetcher.submit(
					{ url: clipboardText },
					{
						method: "POST",
						action: "/api/sections/1/fanfics",
					},
				);
			} else {
				alert("Invalid URL. Please copy a valid AO3 fanfic URL");
			}
		} catch (error) {
			console.error("Failed to read from clipboard: ", error);
		}
	};

	return (
		<DndProvider backend={backend}>
			<div className="flex items-center p-4 justify-end gap-2">
				<Button
					type="button"
					className="ml-4"
					onClick={handleAddFanficFromClipboard}
				>
					Add From Clipboard
				</Button>
				<SettingsModal />
			</div>
			<SectionsView reloadTrigger={reloadTrigger} />
		</DndProvider>
	);
}

export default MainPage;
