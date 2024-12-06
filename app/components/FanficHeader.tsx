import { Fanfic } from "@/db/types";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";

export const FanficHeader = ({
  fanfic,
  showComplete,
  truncate,
}: {
  fanfic: Fanfic;
  showComplete?: boolean;
  truncate?: boolean;
}) => {
  return (
    <>
      <div className="text-sm text-accent-foreground">
        <a
          href={fanfic.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline gap-3"
        >
          <div className="flex flex-row gap-3 font-mono font-bold mt-4 items-center min-w-0">
            <div
              className={cn(
                truncate &&
                  "truncate overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
              )}
            >
              {fanfic.title}
            </div>
            {showComplete && fanfic.completedAt && (
              <CircleCheck className="text-success flex-shrink-0" size="18" />
            )}
          </div>
        </a>
      </div>

      <div className="text-xs font-mono text-muted-foreground">
        {fanfic.authorUrl ? (
          <a
            href={fanfic.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {fanfic.author}
          </a>
        ) : (
          fanfic.author
        )}
      </div>
    </>
  );
};
