import { cn } from "@/lib/utils";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export default function LoadableIcon({
	DefaultIcon,
	state,
	successState,
}: {
	DefaultIcon: React.ComponentType;
	state: "submitting" | "loading" | "idle";
	successState?: boolean;
}) {
	if (state === "submitting") {
		return <Loader2 className={cn("w-fit", "animate-spin")} />;
	}
	if (successState === false) {
		return <XCircle />;
	}
	if (successState) {
		return <CheckCircle />;
	}
	return <DefaultIcon />;
}
