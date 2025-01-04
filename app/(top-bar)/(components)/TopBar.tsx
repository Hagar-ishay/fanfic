import { SearchInput } from "@/(top-bar)/(components)/SearchInput";
import { SettingsModal } from "@/(top-bar)/(components)/Settings";
import { UserButton } from "@clerk/nextjs";

export default async function TopBar() {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-3">
      <div className="flex justify-start">
        <UserButton />
      </div>
      <div className="flex flex-row items-center gap-4 focus:outline-none focus:ring-2 ">
        <SearchInput />
        <div className="flex flex-row gap-2">
          <SettingsModal />
        </div>
      </div>
    </div>
  );
}
