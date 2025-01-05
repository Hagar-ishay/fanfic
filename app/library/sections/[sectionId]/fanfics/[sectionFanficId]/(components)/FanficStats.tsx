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
import { cn, formatDate } from "@/lib/utils";

type StatItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
};

const StatItem = ({ icon, label, value }: StatItemProps) => {
  const iconColor = {
    Created: "text-stat-icon-created",
    Completed: "text-stat-icon-completed",
    Updated: "text-stat-icon-updated",
    Chapters: "text-stat-icon-chapters",
    Words: "text-stat-icon-words",
    Language: "text-stat-icon-language",
    "Last Sent": "text-stat-icon-last-sent",
    "New Chapters": "text-stat-icon-new-chapters",
  };

  const color = iconColor[label as keyof typeof iconColor];

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-md hover:bg-accent/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-transparent to-accent/5">
      <div className={cn("p-2 rounded-full", color)}>{icon}</div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
        <span className="font-semibold text-foreground/90 truncate">
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
};

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
      <div className="rounded-lg border bg-gradient-to-br from-card via-accent/5 to-card text-card-foreground shadow-md overflow-hidden">
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
