"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  kindleEmail: string;
  setKindleEmail: (email: string) => void;
  languageCode: string | null;
  setLanguageCode: (languageCode: string | null) => void;
  enableTranslation: boolean;
  setEnableTranslation: (enabled: boolean) => void;
};

type SearchState = {
  searchInput: string;
  setSearchInput: (input: string) => void;
};

export const useSettingsStore = create(
  persist<SettingsState>(
    (set) => ({
      kindleEmail: "",
      languageCode: null,
      enableTranslation: false,

      setKindleEmail: (email: string) =>
        set((state) => ({
          ...state,
          kindleEmail: email,
        })),
      setLanguageCode: (languageCode: string | null) =>
        set((state) => ({
          ...state,
          languageCode: languageCode,
        })),
      setEnableTranslation: (enabled: boolean) =>
        set((state) => ({
          ...state,
          enableTranslation: enabled,
        })),
    }),
    {
      name: "settings-storage",
    }
  )
);

export const useSearchStore = create<SearchState>((set) => ({
  searchInput: "",
  setSearchInput: (input: string) =>
    set(() => ({
      searchInput: input,
    })),
}));
