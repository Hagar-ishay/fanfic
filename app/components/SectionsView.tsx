import FanficSection from "@/components/FanficSection";
import { Accordion } from "@/components/ui/Accordion";
import type { loader } from "@/routes/api.sections";
import { useSectionsStore } from "@/store";
import { useFetcher } from "@remix-run/react";
import React from "react";

export default function SectionsView({
	reloadTrigger,
}: { reloadTrigger: number }) {
	const fetcher = useFetcher<typeof loader>();
	const openSections = useSectionsStore((state) => state.openSections);
	const setOpenSections = useSectionsStore((state) => state.setOpenSections);

	const sections = fetcher.data?.sections?.map((section) => ({
		...section,
		creationTime: new Date(section.creationTime),
		updateTime: section.updateTime ? new Date(section.updateTime) : null,
	}));

	React.useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data == null) {
			fetcher.load("/api/sections");
		}
	}, [fetcher]);

	return (
		<Accordion
			type="multiple"
			className="w-full p-1"
			value={openSections}
			onValueChange={(value) => setOpenSections(value)}
		>
			{sections?.map((section) => (
				<FanficSection
					key={section.id}
					section={section}
					reloadTrigger={reloadTrigger}
				/>
			))}
		</Accordion>
	);
}
