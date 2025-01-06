import { Search } from "@/(top-bar)/(components)/Search";
import { SettingsModal } from "@/(top-bar)/(components)/Settings";
import { Button } from "@/components/ui/button";
import { listUserFanfics } from "@/db/fanfics";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default async function TopBar() {
  const user = await currentUser();
  const userFanfics = await listUserFanfics(user!.id);

  return (
    <div className="flex flex-row items-center justify-between w-full gap-4">
      <Link href="/" passHref>
        <Button variant="ghost" className="flex items-center gap-2">
          <HomeIcon size={25} />
        </Button>
      </Link>
      <div className="max-w-xl w-full">
        <Search userFanfics={userFanfics} />
      </div>
      <SettingsModal />
    </div>
  );
}
