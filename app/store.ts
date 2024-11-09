import type { Section } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type FanficSectionState = {
	sections: Section[];
	setSections: (newSections: Section[]) => void;
};

export const useSectionsStore = create(
	persist<FanficSectionState>(
		(set) => ({
			sections: [
				{
					id: "ongoing",
					name: "Ongoing",
					fanfics: [{ id: "blah", title: "blue" }],
				},
				{
					id: "completed",
					name: "Completed",
					fanfics: [{ id: "red", title: "black" }],
				},
				{
					id: "shelved",
					name: "Shelved",
					fanfics: [{ id: "white", title: "hello" }],
				},
			],
			setSections: (newSections: Section[]) => set({ sections: newSections }),
		}),
		{
			name: "fanfic-sections-storage",
		},
	),
);
