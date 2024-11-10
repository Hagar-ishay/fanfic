import * as consts from "@/consts";
import type { Fanfic, Section } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type FanficSectionState = {
	sections: Section[];
	setSections: (newSections: Section[]) => void;
	setFanficInSection: (fanfic: Fanfic, sectionId: string) => void;
	setOpenedSections: (sectionIds: string[]) => void;
	deleteFanfic: (fanficId: string) => void;
};

export const useSectionsStore = create(
	persist<FanficSectionState>(
		(set) => ({
			sections: Object.values(consts.DEFAULT_SECTIONS).map((section) => ({
				id: section,
				name: section.valueOf(),
				fanfics: [],
				isOpen: false,
			})),
			setOpenedSections: (sectionIds: string[]) =>
				set((state) => {
					const newSections = state.sections.map((section) => {
						if (sectionIds.includes(section.id)) {
							return { ...section, isOpen: true };
						}
						return { ...section, isOpen: false };
					});
					return { sections: newSections };
				}),
			setSections: (newSections: Section[]) => set({ sections: newSections }),
			setFanficInSection: (fanfic: Fanfic, sectionId: string) =>
				set((state) => {
					const updatedSections = state.sections.map((section) => {
						if (section.id === sectionId) {
							if (!section.fanfics.find((f) => f.id === fanfic.id)) {
								return { ...section, fanfics: [...section.fanfics, fanfic] };
							}
						} else {
							return {
								...section,
								fanfics: section.fanfics.filter((f) => f.id !== fanfic.id),
							};
						}
						return section;
					});
					return { sections: updatedSections };
				}),
			deleteFanfic: (fanficId: string) =>
				set((state) => {
					const updatedSections = state.sections.map((section) => {
						return {
							...section,
							fanfics: section.fanfics.filter(
								(fanfic) => fanfic.id !== fanficId,
							),
						};
					});
					return { sections: updatedSections };
				}),
		}),
		{
			name: "fanfic-sections-storage",
		},
	),
);
