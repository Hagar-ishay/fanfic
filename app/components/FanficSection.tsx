import FanficCard from "@/components/FanficCard";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/Accordion";
import type { Section } from "@/db/types";
import { parseFanfic } from "@/lib/utils";
import type { loader } from "@/routes/api.sections.$sectionId.fanfics";
import { useFetcher } from "@remix-run/react";
import React from "react";

export default function FanficSection({
	section,
	reloadTrigger,
}: { section: Section; reloadTrigger: number }) {
	const fetcher = useFetcher<typeof loader>();

	const fanfics = fetcher.data?.fanfics?.map((fanfic) => parseFanfic(fanfic));

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		if (fetcher.state === "idle") {
			fetcher.load(`/api/sections/${section.id}/fanfics`);
		}
	}, [fetcher, section.id, reloadTrigger]);

	return (
		<AccordionItem value={section.name} className="p-2">
			<AccordionTrigger className="w-full p-4 bg-secondary rounded-md">
				<h2 className="text-xl font-bold text-secondary-foreground">{`${section.name} (${fanfics?.length || "0"})`}</h2>
			</AccordionTrigger>
			<AccordionContent className="p-4 bg-primary-foreground border-t">
				<div className="flex flex-col gap-4">
					{fanfics?.map((fanfic) => (
						<FanficCard
							key={fanfic.id}
							fanfic={fanfic}
							sectionId={section.id}
						/>
					))}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
