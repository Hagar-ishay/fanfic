import { UserFanfic } from "@/db/types";
import {
  Calendar,
  Clock,
  BookOpen,
  Languages,
  BarChart2,
  Send,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type StatItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
};

const StatItem = ({ icon, label, value }: StatItemProps) => (
  <div className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 transition-all duration-200 hover:scale-105">
    <div className="text-accent-foreground/80">{icon}</div>
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="font-medium text-foreground/90">{value || "N/A"}</span>
    </div>
  </div>
);

export const FanficStats = ({ fanfic }: { fanfic: UserFanfic }) => {
  const stats = [
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Created",
      value: formatDate(fanfic.createdAt),
    },
    fanfic.completedAt
      ? {
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: "Completed",
          value: formatDate(fanfic.updatedAt),
        }
      : {
          icon: <Clock className="h-4 w-4" />,
          label: "Updated",
          value: formatDate(fanfic.updatedAt),
        },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: "Chapters",
      value: fanfic.chapterCount,
    },
    {
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Words",
      value: fanfic.wordCount?.toLocaleString(),
    },
    {
      icon: <Languages className="h-4 w-4" />,
      label: "Language",
      value: fanfic.language,
    },
  ];

  const personalStats = [
    {
      icon: <Send className="h-4 w-4" />,
      label: "Last Sent",
      value: formatDate(fanfic.lastSent),
    },
    fanfic.latestStartingChapter && {
      icon: <BookOpen className="h-4 w-4" />,
      label: "New Chapters",
      value: fanfic.latestStartingChapter,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-gradient-to-br from-card to-accent/5 text-card-foreground shadow-sm">
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <StatItem key={index} {...stat} />
            ))}
            {personalStats.map(
              (stat, index) => stat && <StatItem key={index} {...stat} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
