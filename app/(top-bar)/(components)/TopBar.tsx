import { HomeIcon } from "@/(top-bar)/(components)/HomeIcon";

export default async function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <header className="flex flex-row items-center justify-between sticky top-0 z-50 pt-4 pb-4 pl-1 pr-1 shadow-md gap-2 bg-sidebar backdrop-blur-md">
      <div className="flex flex-row flex-nowrap items-center justify-between w-full px-2 h-14">
        <div className="min-w-fit">
          <HomeIcon />
        </div>
        {children}
      </div>
    </header>
  );
}
