import { create } from "zustand";
import { persist } from "zustand/middleware";

type sectionState = {
	openSections: string[];
	setOpenSections: (sectionList: string[]) => void;
};

type SettingsState = {
	kindleEmail: string;
	setEmail: (email: string) => void;
	languageCode: string | null;
	setLanguageCode: (languageCode: string) => void;
};

export const useSettingsStore = create(
	persist<SettingsState>(
		(set) => ({
			kindleEmail: "",
			languageCode: null,
			setEmail: (email: string) =>
				set((state) => ({
					...state,
					kindleEmail: email,
				})),
			setLanguageCode: (languageCode: string) =>
				set((state) => ({
					...state,
					languageCode: languageCode,
				})),
		}),
		{
			name: "settings-storage",
		},
	),
);

export const useSectionsStore = create(
	persist<sectionState>(
		(set) => ({
			openSections: [],
			setOpenSections: (sectionList: string[]) =>
				set((state) => ({
					...state,
					openSections: sectionList,
				})),
		}),
		{
			name: "sections-storage",
		},
	),
);
