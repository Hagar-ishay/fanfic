"use client";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { getIsDesktop } from "@/lib/utils";

type HelpProps = {
  title: string;
  description: string;
  helpContent: { icon?: React.ReactNode; content: string }[];
  trigger: React.ReactNode;
};

export function Help({ title, description, helpContent, trigger }: HelpProps) {
  const isDesktop = getIsDesktop();
  return (
    <div className="min-w-fit">
      <DrawerDialog>
        <DrawerDialogTrigger asChild>{trigger}</DrawerDialogTrigger>
        <DrawerDialogContent className="p-6">
          <DrawerDialogHeader>
            <DrawerDialogTitle>{title}</DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDialogDescription className={isDesktop ? "" : "mb-6 pl-3"}>{description}</DrawerDialogDescription>

          <div className="space-y-4 border-t p-4">
            {helpContent.map(({ icon, content }, index) => (
              <div key={index} className="flex flex-row items-start gap-3 text-sm">
                <div className="flex items-center justify-center p-1 h-6 w-6 text-muted-foreground shrink-0">
                  {icon}
                </div>
                <p className="text-muted-foreground leading-tight pt-0.5">{content}</p>
              </div>
            ))}
          </div>
        </DrawerDialogContent>
      </DrawerDialog>
    </div>
  );
}
