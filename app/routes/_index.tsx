import SectionsView from "@/components/SectionsView";
import { SettingsModal } from "@/components/Settings";
import { Button } from "@/components/ui/Button";
import * as consts from "@/consts";
import { cn } from "@/lib/utils";
import type { action as updateAction } from "@/routes/api.check-for-updates";
import type { action as addAction } from "@/routes/api.sections.$sectionId.fanfics";
import { useFetcher } from "@remix-run/react";
import { CheckCircle, Loader2, RotateCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function MainPage() {
	if (typeof window === "undefined") {
		return; // Prevents running on server
	}
	const [reloadTrigger, setReloadTrigger] = useState(0);

	const addFanficFetcher = useFetcher<typeof addAction>();
	const checkUpdatesFetcher = useFetcher<typeof updateAction>();

	let CheckUpdates = RotateCw;
	if (checkUpdatesFetcher.state === "submitting") {
		CheckUpdates = Loader2;
	} else if (
		checkUpdatesFetcher.data?.success &&
		!checkUpdatesFetcher.data.isCache
	) {
		checkUpdatesFetcher.data.data.updatedFanfics.map((fanficTitle) =>
			toast.success(`Fic ${fanficTitle} updated successfully`),
		);

		CheckUpdates = CheckCircle;
	} else if (checkUpdatesFetcher.data && !checkUpdatesFetcher.data.success) {
		toast.error(`An error occurred: ${checkUpdatesFetcher.data.data}`);
		CheckUpdates = XCircle;
	}

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
		<div className="flex flex-col h-screen">
			<div className="sticky top-0 z-20 p-4 shadow-md bg-accent">
				<div className="flex items-center justify-end gap-2">
					<Button
						type="button"
						className="ml-4 w-fit"
						onClick={handleCheckForUpdates}
						disabled={checkUpdatesFetcher.state === "submitting"}
					>
						<CheckUpdates
							className={cn(
								"w-fit",
								checkUpdatesFetcher.state === "submitting" && "animate-spin",
							)}
						/>
					</Button>
					<Button
						type="button"
						className="w-fit"
						onClick={handleAddFanficFromClipboard}
					>
						Add From Clipboard
					</Button>
					<SettingsModal />
				</div>
			</div>
			<div className="flex-1 overflow-y-auto">
				<SectionsView reloadTrigger={reloadTrigger} />
			</div>
		</div>
	);
}

export default MainPage;
