import { Badge } from "@/components/ui/badge";
import { Tags as TagType } from "@/db/types";

export function Tags({ tags }: { tags: TagType }) {
  return (
    <div className="bg-accent/5 rounded-lg p-4">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2 text-foreground/90">
          Tags
        </h3>
        <div className="grid grid-cols-1 md:auto-cols-auto gap-4 auto-rows-min">
          {Object.entries(tags)
            .filter(([_, values]) => values.length > 0)
            .sort(([keyA, valuesA], [keyB, valuesB]) => {
              if (keyA.toLowerCase().includes("additional")) return 1;
              if (keyB.toLowerCase().includes("additional")) return -1;
              return valuesB.length - valuesA.length;
            })
            .map(([key, values], idx) => (
              <div
                key={idx}
                className={`rounded-lg border bg-gradient-to-br from-card to-accent/5 p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                  key.toLowerCase().includes("additional")
                    ? "md:col-span-2"
                    : values.length > 5
                      ? "md:col-span-2"
                      : "md:col-span-1"
                }`}
              >
                <h4 className="font-medium text-sm uppercase tracking-wide text-accent-foreground/80 mb-3">
                  {key}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((value, valueIdx) => (
                    <Badge
                      key={valueIdx}
                      variant="secondary"
                      className="px-2.5 py-1 text-xs hover:bg-accent/80 hover:text-accent-foreground transition-colors duration-200"
                    >
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
