"use client";

import { useSearchStore } from "@/store";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function SearchInput() {
  const { searchInput, setSearchInput } = useSearchStore();

  return (
    <div className="relative">
      <Input
        value={searchInput}
        className="pl-8 bg-muted-2"
        placeholder="Search"
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50 " />
      {searchInput && (
        <Button
          onClick={() => setSearchInput("")}
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 "
        >
          <X />
        </Button>
      )}
    </div>
  );
}
