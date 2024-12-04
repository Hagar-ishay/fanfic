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
      <div
        className={cn(
          "text-sm font-mono text-accent-foreground",
          showComplete && "flex flex-row justify-between"
        )}
      >
        <a
          href={fanfic.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("hover:underline gap-3", truncate && "truncate")}
        >
          {fanfic.title}
        </a>
        {showComplete && fanfic.completedAt && (
          <CircleCheck className="text-success" size="20" />
        )}
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
