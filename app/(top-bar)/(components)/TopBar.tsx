import { Search } from "@/(top-bar)/(components)/Search";
import { SettingsModal } from "@/(top-bar)/(components)/Settings";
import { listUserFanfics } from "@/db/fanfics";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function TopBar() {
  const user = await currentUser();
  const userFanfics = await listUserFanfics(user!.id);

  return (
    <div className="flex flex-row items-center justify-between w-full gap-3">
      <div className="flex justify-start">
        <UserButton />
      </div>
      <div className="flex flex-row items-center gap-4 focus:outline-none focus:ring-2 ">
        <Search userFanfics={userFanfics} />
        <div className="flex flex-row gap-2">
          <SettingsModal />
        </div>
      </div>
    </div>
  );
}
