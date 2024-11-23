"use client";
import type React from "react";
import {
	Tooltip as BaseTooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

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
