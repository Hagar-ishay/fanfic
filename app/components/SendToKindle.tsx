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

	const handleSend = () => {
		fetcher.submit(
			{
				kindleEmail,
				fanfic: JSON.stringify(fanfic),
				translationLanguage,
			},
			{
				method: "POST",
				action: `/api/sections/${sectionId}/fanfics/${fanfic.id}/send-to-kindle`,
			},
		);
	};

	return (
		<Tooltip
			description={kindleEmail ? "Send Fic to Kindle" : "Kindle Email not set"}
		>
			<Button onClick={handleSend} disabled={isSendDisabled}>
				<LoadableIcon
					DefaultIcon={SendHorizontal}
					state={fetcher.state}
					successState={fetcher.data?.success}
				/>
			</Button>
		</Tooltip>
	);
}
