"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  kindleEmail: string;
  setEmail: (email: string) => void;
  languageCode: string | null;
  setLanguageCode: (languageCode: string | null) => void;
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

      setEmail: (email: string) =>
        set((state) => ({
          ...state,
          kindleEmail: email,
        })),
      setLanguageCode: (languageCode: string | null) =>
        set((state) => ({
          ...state,
          languageCode: languageCode,
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
