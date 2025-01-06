"use client";
import {
  DrawerDialog,
  DrawerDialogClose,
  DrawerDialogContent,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/base/DrawerDialog";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertSection } from "@/db/sections";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { ListPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export function AddNewSectionButton({
  sectionId,
}: {
  sectionId: number | null;
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ displayName: string; name: string }>();
  const [isPending, startTransition] = useTransition();
  const [shouldAddSection, setShouldAddSection] = useState(false);

  if (!user) {
    return null;
  }

  const onSubmit = async (data: { name: string }) => {
    const title = "Add Section";
    startTransition(() => {
      (async () => {
        try {
          await insertSection({
            name: data.name,
            userId: user.id,
            parentId: sectionId,
          });
          toast({ title, description: "Added Successfully!" });
          setShouldAddSection(false);
        } catch (err) {
          const error = errorMessage(err);
          console.error(err);
          toast({ title, description: error, variant: "destructive" });
        }
      })();
    });
  };

  return (
    <>
      <Tooltip description="Add new Section">
        <Button
          className="w-8 h-8"
          size="icon"
          variant={"outline"}
          onClick={() => setShouldAddSection(true)}
          disabled={isPending}
        >
          <LoadableIcon DefaultIcon={ListPlus} isPending={isPending} />
        </Button>
      </Tooltip>
      <DrawerDialog open={shouldAddSection} onOpenChange={setShouldAddSection}>
        <DrawerDialogContent>
          <DrawerDialogHeader>
            <DrawerDialogTitle>Add New Section</DrawerDialogTitle>
          </DrawerDialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name", { required: true })} />
              {errors.displayName && <span>This field is required</span>}
            </div>
            <DrawerDialogFooter>
              <Button type="submit" disabled={isPending}>
                Save
              </Button>
              <DrawerDialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DrawerDialogClose>
            </DrawerDialogFooter>
          </form>
        </DrawerDialogContent>
      </DrawerDialog>
    </>
  );
}
