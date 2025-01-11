import { HomeIcon } from "@/(top-bar)/(components)/HomeIcon";
import { Search } from "@/(top-bar)/(components)/Search";
import { SettingsModal } from "@/(top-bar)/(components)/Settings";
import { Button } from "@/components/ui/button";
import { listUserFanfics } from "@/db/fanfics";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default async function TopBar() {
  const user = await currentUser();
  const userFanfics = await listUserFanfics(user!.id);

  return (
    <div className="flex flex-row items-center justify-between w-full gap-4 h-14">
      <HomeIcon />
      <Search userFanfics={userFanfics} />
      <SettingsModal />
    </div>
  );
}
