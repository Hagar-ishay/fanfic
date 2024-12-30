import { UserButton } from "@clerk/nextjs";
import type React from "react";
import { SettingsModal } from "@/(top-bar)/(components)/Settings";
import { SearchInput } from "@/(top-bar)/(components)/SearchInput";

export default async function TopBar() {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-3">
      <div className="flex justify-start">
        <UserButton />
      </div>
      <div className="flex flex-row items-center gap-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 ">
        <SearchInput />
        <div className="flex flex-row gap-2">
          <SettingsModal />
        </div>
      </div>
    </div>
  );
}
