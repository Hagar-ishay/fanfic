import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

type HelpProps = {
  title: string;
  description: string;
  helpContent: { icon?: React.ReactNode; content: string }[];
};

export function Help({ title, description, helpContent }: HelpProps) {
  return (
    <div className="min-w-fit">
      <DrawerDialog>
        <Tooltip description="Help">
          <DrawerDialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <HelpCircle />
            </Button>
          </DrawerDialogTrigger>
        </Tooltip>

        <DrawerDialogContent>
          <DrawerDialogHeader>
            <DrawerDialogTitle>{title}</DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDialogDescription className="mb-6">
            {description}
          </DrawerDialogDescription>

          <div className="space-y-4">
            {helpContent.map(({ icon, content }, index) => (
              <div
                key={index}
                className="flex flex-row items-start gap-3 text-sm"
              >
                <div className="flex items-center justify-center p-1 h-6 w-6 text-muted-foreground shrink-0">
                  {icon}
                </div>
                <p className="text-muted-foreground leading-tight pt-0.5">
                  {content}
                </p>
              </div>
            ))}
          </div>
        </DrawerDialogContent>
      </DrawerDialog>
    </div>
  );
}
