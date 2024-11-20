import { DropdownMenu, type Item } from "@/components/base/Dropdown";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import type { Fanfic } from "@/db/types";
import type { action } from "@/routes/api.sections.$sectionId.fanfics.$fanficId.send-to-kindle";
import { useSettingsStore } from "@/store";
import { useFetcher } from "@remix-run/react";
import { SendHorizontal } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function SendToKindle({
	fanfic,
	sectionId,
}: {
	fanfic: Fanfic;
	sectionId: number;
}) {
	const kindleEmail = useSettingsStore((state) => state.kindleEmail);
	const translationLanguage = useSettingsStore((state) => state.languageCode);
	const fetcher = useFetcher<typeof action>();
	const isSendDisabled =
		!kindleEmail ||
		fetcher.data?.success ||
		fetcher.state === "submitting" ||
		!(!fanfic.lastSent || fanfic.lastSent < fanfic.updatedAt);

	React.useEffect(() => {
		if (fetcher.data?.success) {
			toast("Email sent successfully");
		} else if (fetcher.data && !fetcher.data.success && fetcher.data.message) {
			toast(`Failed sending email: ${fetcher.data.message}`);
		}
	}, [fetcher.data]);

	const handleSend = (startingChapter?: number | null) => {
		fetcher.submit(
			{
				kindleEmail,
				fanfic: JSON.stringify(fanfic),
				translationLanguage,
				startingChapter: startingChapter || null,
			},
			{
				method: "POST",
				action: `/api/sections/${sectionId}/fanfics/${fanfic.id}/send-to-kindle`,
			},
		);
	};

	const Trigger = ({ onClick }: { onClick?: typeof handleSend }) => {
		return (
			<Button
				disabled={isSendDisabled}
				onClick={
					onClick ? () => onClick(fanfic.latestStartingChapter) : undefined
				}
			>
				<LoadableIcon
					DefaultIcon={SendHorizontal}
					state={fetcher.state}
					successState={fetcher.data?.success}
				/>
			</Button>
		);
	};

	const items: Item[] = [
		{
			title: "Send Entire Fic",
			onSelect: handleSend,
		},
	];

	const latestFinalChapter = Number(fanfic.chapterCount?.split("/")[0]);

	if (
		fanfic.latestStartingChapter &&
		fanfic.latestStartingChapter < latestFinalChapter &&
		fanfic.lastSent
	) {
		const title = `Send chapters ${fanfic.latestStartingChapter} - ${latestFinalChapter}`;
		items.push({
			title: title,
			onSelect: handleSend,
			value: fanfic.latestStartingChapter,
		});
	}

	return items.length > 1 ? (
		<DropdownMenu
			tooltip={kindleEmail ? "Send Fic to Kindle" : "Kindle Email not set"}
			trigger={<Trigger />}
			items={items}
		/>
	) : (
		<Trigger onClick={handleSend} />
	);
}
