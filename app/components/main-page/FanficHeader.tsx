import { Fanfic } from "@/db/types";

export const FanficHeader = ({ fanfic }: { fanfic: Fanfic }) => {
  return (
    <div className="flex flex-col">
      <div className="text-md text-accent-foreground gap-3 font-semibold mt-4 items-center min-w-0">
        <a
          href={fanfic.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline gap-3"
        >
          {fanfic.title}
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
    </div>
  );
};
