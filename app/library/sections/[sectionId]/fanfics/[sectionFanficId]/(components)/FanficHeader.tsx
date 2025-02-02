import { UserFanfic } from "@/db/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const FanficHeader = ({ fanfic }: { fanfic: UserFanfic }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row text-md text-accent-foreground gap-2 font-semibold mt-4 items-center min-w-0">
        {fanfic.title}
        <Link href={fanfic.sourceUrl} target="_blank">
          <ExternalLink size={15} />
        </Link>
      </div>

      <div className="text-xs font-mono text-muted-foreground">
        <div className="flex flex-row text-md text-accent-foreground gap-2 font-semibold mt-4 items-center min-w-0">
          {fanfic.author}
          {fanfic.authorUrl && (
            <Link href={fanfic.authorUrl} target="_blank">
              <ExternalLink size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
