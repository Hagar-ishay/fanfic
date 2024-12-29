import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

export async function Section({ displayName }: { displayName: string }) {
  return (
    <Card className="cursor-pointer p-4 border-none border-0 shadow-none">
      <CardContent className="flex items-center p-3 pl-6 mb-6 text-lg font-semibold justify-between">
        {displayName}
        <ChevronRight className="ml-2" />
      </CardContent>
      <Separator />
    </Card>
  );
}
