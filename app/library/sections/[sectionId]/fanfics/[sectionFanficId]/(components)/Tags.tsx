import { Badge } from "@/components/ui/badge";
import { Tags as TagType } from "@/db/types";

export function Tags({ tags }: { tags: TagType }) {
  return (
    <div className="relative bg-gradient-to-br from-card via-accent/5 to-card rounded-lg p-4 sm:p-6 border shadow-md">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2 text-foreground/90">
          Tags
        </h3>
        <div className="grid grid-cols-1 md:auto-cols-auto gap-3 sm:gap-4 auto-rows-min">
          {Object.entries(tags)
            .filter(([, values]) => values.length > 0)
            .sort(([keyA, valuesA], [keyB, valuesB]) => {
              if (keyA.toLowerCase().includes("additional")) return 1;
              if (keyB.toLowerCase().includes("additional")) return -1;
              return valuesB.length - valuesA.length;
            })
            .map(([key, values], idx) => {
              return (
                <div
                  key={idx}
                  className={`rounded-lg border bg-gradient-to-br from-background to-accent/5 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                    key.toLowerCase().includes("additional")
                      ? "md:col-span-2"
                      : values.length > 5
                        ? "md:col-span-2"
                        : "md:col-span-1"
                  }`}
                >
                  <h4 className="font-medium text-sm uppercase tracking-wider text-accent-foreground/80 mb-4 border-b pb-2">
                    {key}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, valueIdx) => (
                      <Badge
                        key={valueIdx}
                        variant="secondary"
                        className={
                          "px-3 py-1.5 text-xs transition-all duration-200 hover:scale-105 hover:bg-accent hover:text-accent-foreground"
                        }
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
