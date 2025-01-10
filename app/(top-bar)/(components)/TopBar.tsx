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
      <Link href="/" passHref className="min-w-14 min-h-10">
        <Image
          src="/icon.png"
          alt="Home"
          width={80}
          height={80}
          className="mix-blend-multiply absolute top-1 left-2"
        />
      </Link>
      <div className="max-w-xl w-full">
        <Search userFanfics={userFanfics} />
      </div>
      <SettingsModal />
    </div>
  );
}
