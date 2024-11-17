import SectionsView from "@/components/SectionsView";
import { SettingsModal } from "@/components/Settings";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as consts from "@/consts";
import { listFanfics, selectSections } from "@/db/db";
import type { action as updateAction } from "@/routes/api.check-for-updates";
import type { action as addAction } from "@/routes/api.sections.$sectionId.fanfics";
import {
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { ClipboardPlus, RotateCw, Search, X } from "lucide-react";
import React, { useState } from "react";
import { typedjson } from "remix-typedjson";
import { toast } from "sonner";

export async function loader(args: LoaderFunctionArgs) {
	const fanfics = await listFanfics();
	const sections = await selectSections();

	return typedjson({ fanfics, sections });
}

function MainPage() {
	const addFanficFetcher = useFetcher<typeof addAction>();
	const addFanficSuccessState = addFanficFetcher.data?.success;

	const checkUpdatesFetcher = useFetcher<typeof updateAction>();
	const isCheckUpdatesSubmitting = checkUpdatesFetcher.state === "submitting";
	const checkUpdatesSuccessState = checkUpdatesFetcher.data?.success;

	const [searchInput, setSearchInput] = useState("");

	React.useEffect(() => {
		if (checkUpdatesSuccessState && !checkUpdatesFetcher.data?.isCache) {
			checkUpdatesFetcher.data?.data.updatedFanfics.map((fanficTitle) =>
				toast.success(`Fic ${fanficTitle} updated successfully`),
			);
		} else if (checkUpdatesFetcher.data && !checkUpdatesFetcher.data.success) {
			toast.error(`An error occurred: ${checkUpdatesFetcher.data.data}`);
		}
	}, [checkUpdatesFetcher.data, checkUpdatesSuccessState]);

	React.useEffect(() => {
		if (addFanficSuccessState === false) {
			const message = addFanficFetcher.data?.message;
			if (message?.includes("duplicate key value violates unique constraint")) {
				toast.error("This fic already exists :)");
			} else {
				toast.error(`An error occurred: ${message}`);
			}
		}
	}, [addFanficSuccessState, addFanficFetcher.data]);

	const handleAddFanficFromClipboard = async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (clipboardText.startsWith(`${consts.AO3_LINK}/works/`)) {
				addFanficFetcher.submit(
					{ url: clipboardText },
					{
						method: "POST",
						action: "/api/sections/3/fanfics",
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
			<SignedIn>
				<div className="sticky top-0 z-20 p-4 shadow-md bg-accent flex flex-row justify-between">
					<div className="flex items-start">
						<UserButton />
					</div>
					<div className="flex items-center justify-end gap-2 ">
						<div className="justify-center relative">
							<Input
								value={searchInput}
								className="pl-8"
								placeholder="Search"
								onChange={(event) => setSearchInput(event.target.value)}
							/>
							<Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
							{searchInput && (
								<Button
									onClick={() => setSearchInput("")}
									variant="ghost"
									size="icon"
									className="absolute right-1 top-1/2 -translate-y-1/2 "
								>
									<X />
								</Button>
							)}
						</div>
						<Button
							type="button"
							className="ml-4 w-fit"
							onClick={handleCheckForUpdates}
							disabled={isCheckUpdatesSubmitting}
						>
							<LoadableIcon
								DefaultIcon={RotateCw}
								state={checkUpdatesFetcher.state}
								successState={checkUpdatesSuccessState}
							/>
						</Button>
						<Button type="button" onClick={handleAddFanficFromClipboard}>
							<LoadableIcon
								DefaultIcon={ClipboardPlus}
								state={addFanficFetcher.state}
								successState={addFanficSuccessState}
							/>
						</Button>
						<SettingsModal />
					</div>
				</div>
				<div className="flex-1 overflow-y-auto">
					<SectionsView searchInput={searchInput} />
				</div>
			</SignedIn>
			<SignedOut>
				<div className="flex flex-row justify-center relative items-center gap-4 h-screen max-h-screen">
					<Button>
						<SignUpButton />
					</Button>
					<Button>
						<SignInButton />
					</Button>
				</div>
			</SignedOut>
		</div>
	);
}

export default MainPage;
