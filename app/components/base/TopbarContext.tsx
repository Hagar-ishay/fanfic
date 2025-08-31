"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type BreadcrumbSegment = {
  label: string;
  href: string;
};

type TopbarContextType = {
  segments: BreadcrumbSegment[];
  actions: ReactNode;
  setTopbarContent: (segments: BreadcrumbSegment[], actions?: ReactNode) => void;
};

const TopbarContext = createContext<TopbarContextType | null>(null);

export function TopbarProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState<BreadcrumbSegment[]>([]);
  const [actions, setActions] = useState<ReactNode>(null);

  const setTopbarContent = (newSegments: BreadcrumbSegment[], newActions?: ReactNode) => {
    setSegments(newSegments);
    setActions(newActions || null);
  };

  return (
    <TopbarContext.Provider value={{ segments, actions, setTopbarContent }}>
      {children}
    </TopbarContext.Provider>
  );
}

export function useTopbar() {
  const context = useContext(TopbarContext);
  if (!context) {
    throw new Error("useTopbar must be used within a TopbarProvider");
  }
  return context;
}