import SectionsView from "@/components/SectionsView";
import { SettingsModal } from "@/components/Settings";
import { Button } from "@/components/ui/Button";
import * as consts from "@/consts";
import { cn, isMobileDevice } from "@/lib/utils";
import type { action as updateAction } from "@/routes/api.check-for-updates";
import type { action as addAction } from "@/routes/api.sections.$sectionId.fanfics";
import { useFetcher } from "@remix-run/react";
import { CheckCircle, Loader2, RotateCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { toast } from "sonner";

function MainPage() {
	const [reloadTrigger, setReloadTrigger] = useState(0);
	const [backend, setBackend] = useState(() => HTML5Backend);
	const addFanficFetcher = useFetcher<typeof addAction>();
	const checkUpdatesFetcher = useFetcher<typeof updateAction>();

	let CheckUpdates = RotateCw;
	if (checkUpdatesFetcher.state === "submitting") {
		CheckUpdates = Loader2;
	} else if (checkUpdatesFetcher.data?.success) {
		CheckUpdates = CheckCircle;
	} else if (checkUpdatesFetcher.data && !checkUpdatesFetcher.data.success) {
		CheckUpdates = XCircle;
	}

	useEffect(() => {
		const chosenBackend = isMobileDevice() ? TouchBackend : HTML5Backend;
		setBackend(() => chosenBackend);
	}, []);

	if (addFanficFetcher.data && !addFanficFetcher.data.success) {
		const message = addFanficFetcher.data.message;
		if (message?.includes("duplicate key value violates unique constraint")) {
			toast.error("This fic already exists :)");
		} else {
			toast.error(`An error occurred: ${message}`);
		}
	}
	if (addFanficFetcher.data?.success) {
		setReloadTrigger((prev) => prev + 1);
		toast.success("Fanfic added successfully!");
	}

	useEffect(() => {
		if (checkUpdatesFetcher.data && !checkUpdatesFetcher.data.success) {
			toast.error(`An error occurred: ${checkUpdatesFetcher.data.message}`);
		} else if (checkUpdatesFetcher.data?.success) {
			toast.success("Updates checked successfully!");
		}
	}, [checkUpdatesFetcher.data]);

	const handleAddFanficFromClipboard = async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (clipboardText.startsWith(`${consts.AO3_LINK}/works/`)) {
				addFanficFetcher.submit(
					{ url: clipboardText },
					{
						method: "POST",
						action: "/api/sections/1/fanfics",
					},
				);
			} else {
				toast.error("Invalid URL. Please copy a valid AO3 fanfic URL");
			}
		} catch (error) {
			console.error("Failed to read from clipboard: ", error);
			toast.error("Failed to read from clipboard");
		}
	};

	const handleCheckForUpdates = () => {
		checkUpdatesFetcher.submit(null, {
			method: "POST",
			action: "/api/check-for-updates",
		});
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
				<Button
					type="button"
					className="ml-4"
					onClick={handleCheckForUpdates}
					disabled={checkUpdatesFetcher.state === "submitting"}
				>
					<CheckUpdates
						className={cn(
							"w-[6%]",
							checkUpdatesFetcher.state === "submitting" && "animate-spin",
						)}
					/>
				</Button>
				<SettingsModal />
			</div>
			<SectionsView reloadTrigger={reloadTrigger} />
		</DndProvider>
	);
}

export default MainPage;
