import { UserButton } from "@clerk/nextjs";
import type React from "react";
import { SettingsModal } from "@/components/header/Settings";
import { AddFanficButton } from "@/components/header/AddFanficButton";
import { SearchInput } from "@/components/header/SearchInput";

export default async function Header() {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-3">
      <div className="flex justify-start">
        <UserButton />
      </div>
      <div className="flex flex-row items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 ">
        <SearchInput />
        <div className="flex flex-row gap-2">
          <AddFanficButton />
          <SettingsModal />
        </div>
      </div>
    </div>
  );
}
