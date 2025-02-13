"use client";

import { SavedSearch } from "@/db/types";
import { Edit, Trash2 } from "lucide-react";
import React from "react";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSavedSearch } from "@/db/savedSearches";
import { SearchBuilder } from "@/explore/(components)/SearchBuilder";

export function SavedSearchContextMenu({
  savedSearch,
  trigger,
}: {
  savedSearch: SavedSearch;
  trigger: React.ReactNode;
}) {
  const triggerRef = React.useRef<HTMLDivElement>(null);

  async function onDelete() {
    await deleteSavedSearch(savedSearch.id);
  }

  const options = [
    {
      icon: <Edit size={17} />,
      name: "Edit",
      action: () => {
        triggerRef.current?.click();
      },
    },
    {
      icon: <Trash2 size={17} />,
      name: "Delete",
      confirmationHeader: `Are you sure you want to delete search ${savedSearch.name}?`,
      action: onDelete,
      destructive: true,
    },
  ];

  return (
    <>
      <SearchBuilder
        trigger={<div hidden ref={triggerRef} />}
        savedSearch={savedSearch}
      />
      <ContextMenu
        header={savedSearch.name}
        options={options}
        trigger={trigger}
      />
    </>
  );
}
