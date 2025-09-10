"use client";
import { Button } from "@/components/ui/button";
import { UserFanfic } from "@/db/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { sendKudos } from "@/library/sections/[sectionId]/(server)/kudosAction";
import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";

export function Kudos({ fanfic, hasAo3Credentials }: { fanfic: UserFanfic; hasAo3Credentials: boolean }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticKudos, setOptimisticKudos] = useOptimistic(
    fanfic.kudos || false,
    (_, newKudos: boolean) => newKudos
  );

  const handleKudos = () => {
    if (!hasAo3Credentials) {
      toast({
        title: "AO3 Account Required",
        description: "Please add your AO3 credentials in Settings to leave kudos.",
        variant: "destructive",
      });
      return;
    }

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

  if (!hasAo3Credentials) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="text-muted-foreground opacity-50 cursor-not-allowed"
        onClick={handleKudos}
        title="Add AO3 credentials in Settings to leave kudos"
      >
        <Heart className="h-5 w-5" />
      </Button>
    );
  }

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
