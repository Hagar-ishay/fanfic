import { Button } from "@/components/ui/Button";
import type { Fanfic } from "@/db/types";
import { cn } from "@/lib/utils";
import type { action } from "@/routes/api.sections.$sectionId.fanfics.$fanficId.send-to-kindle";
import { useSettingsStore } from "@/store";
import { useFetcher } from "@remix-run/react";
import { CheckCircle, Loader2, SendHorizontal, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function SendToKindle({
	fanfic,
	sectionId,
}: {
	fanfic: Fanfic;
	sectionId: number;
}) {
	const kindleEmail = useSettingsStore((state) => state.kindleEmail);
	const fetcher = useFetcher<typeof action>();

	let Icon = SendHorizontal;
	if (fetcher.state === "submitting") {
		Icon = Loader2;
	} else if (fetcher.data?.success) {
		Icon = CheckCircle;
	} else if (fetcher.data && !fetcher.data.success) {
		Icon = XCircle;
	}

	const isSendDisabled =
		!kindleEmail || fetcher.data?.success || fetcher.state === "submitting";

	fetcher.data?.success && toast("Email sent successfully");

	const handleSend = () => {
		fetcher.submit(
			{
				kindleEmail,
				fanfic: JSON.stringify(fanfic),
			},
			{
				method: "POST",
				action: `/api/sections/${sectionId}/fanfics/${fanfic.id}/send-to-kindle`,
			},
		);
	};

	return (
		<Button
			title="Send to kindle"
			onClick={handleSend}
			disabled={isSendDisabled}
		>
			<Icon
				className={cn(
					"w-[6%]",
					fetcher.state === "submitting" && "animate-spin",
				)}
			/>
		</Button>
	);
}
