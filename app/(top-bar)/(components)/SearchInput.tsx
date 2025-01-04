import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export function SearchInput() {
  return (
    <div className="relative max-w-60 min-w-0 w-full">
      <Link href="/library/search">
        <Button variant="outline" className="pl-8 text-sm cursor-text pr-10">
          Search Library...
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50 " />
        </Button>
      </Link>
    </div>
  );
}
