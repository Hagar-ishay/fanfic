import {
	Tooltip as BaseTooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type React from "react";

export function Tooltip({
	description,
	children,
}: {
	description: string;
	children: React.ReactNode;
}) {
	return (
		<TooltipProvider>
			<BaseTooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent>{description}</TooltipContent>
			</BaseTooltip>
		</TooltipProvider>
	);
}
