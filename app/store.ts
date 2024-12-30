import { create } from "zustand";
import { persist } from "zustand/middleware";
import React from "react";

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

type SectionTransitionState = {
  isPending: boolean;
  startTransition: (callback: () => void) => void;
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

export const useTransitionStore = create<SectionTransitionState>((set) => ({
  isPending: false,
  startTransition: () => {},
}));

export function useStoreTransition() {
  const storeStartTransition = useTransitionStore(
    (state) => state.startTransition
  );
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    useTransitionStore.setState({ isPending });
  }, [isPending]);

  React.useEffect(() => {
    useTransitionStore.setState({
      startTransition: (cb: () => void) => startTransition(cb),
    });
  }, [startTransition]);

  return {
    isPending,
    startTransition: storeStartTransition,
  };
}
