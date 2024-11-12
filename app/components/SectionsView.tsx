import FanficSection from "@/components/FanficSection";
import { Accordion } from "@/components/ui/Accordion";
import type { Section } from "@/db/types";
import type { loader } from "@/routes/api/sections";
import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import React from "react";

export default function SectionsView() {
	const fetcher = useFetcher<typeof loader>();
	const sections = fetcher.data?.sections;
	const [openedSections, setOpenedSections] = React.useState<string[]>([]);

	React.useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data == null) {
			fetcher.load("/api/sections");
		}
	}, [fetcher]);

	if (fetcher.state === "loading") {
		return <p>Loading...</p>;
	}

	return (
		<Accordion
			type="multiple"
			className="w-full p-1"
			value={openedSections}
			onValueChange={(value) => setOpenedSections(value)}
		>
			{sections?.map((section) => (
				<FanficSection key={section.id} section={section} />
			))}
		</Accordion>
	);
}
