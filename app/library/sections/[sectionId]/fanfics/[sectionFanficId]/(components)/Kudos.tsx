"use client";
import { Button } from "@/components/ui/button";
import { UserFanfic } from "@/db/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { sendKudos } from "@/library/sections/[sectionId]/(server)/kudosAction";
import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";

export function Kudos({ fanfic }: { fanfic: UserFanfic }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticKudos, setOptimisticKudos] = useOptimistic(
    fanfic.kudos || false,
    (_, newKudos: boolean) => newKudos
  );

  const handleKudos = () => {
    startTransition(async () => {
      setOptimisticKudos(!optimisticKudos);
      const result = await sendKudos({
        externalId: fanfic.externalId,
        sectionId: fanfic.sectionId,
        userFanficId: fanfic.id,
        currentKudos: fanfic.kudos || false,
      });

      if (!result.success) {
        toast({
          title: "Could not leave kudos",
          description: result.message,
          variant: "destructive",
        });
        // Revert optimistic update on error
        setOptimisticKudos(fanfic.kudos || false);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      className="text-muted-foreground hover:text-primary transition-colors"
      onClick={handleKudos}
    >
      <Heart className={cn("h-5 w-5", optimisticKudos && "fill-primary text-primary")} />
    </Button>
  );
}
