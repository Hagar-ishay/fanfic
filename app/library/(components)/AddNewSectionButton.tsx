"use client";
import {
  DrawerDialog,
  DrawerDialogClose,
  DrawerDialogContent,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertSection } from "@/db/sections";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";

export function AddNewSectionButton({
  sectionId,
  ref,
}: {
  sectionId: number | null;
  ref?: React.RefObject<HTMLDivElement>;
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const { register, handleSubmit } = useForm<{ name: string }>();

  if (!user) {
    return null;
  }

  const onSubmit = async (data: { name: string }) => {
    const title = "Add Section";
    try {
      await insertSection({
        name: data.name,
        userId: user.id,
        parentId: sectionId,
      });
      toast({ title, description: "Added Successfully!" });
    } catch (err) {
      const error = errorMessage(err);
      console.error(err);
      toast({ title, description: error, variant: "destructive" });
    }
  };

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>
        <div ref={ref} hidden></div>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Add New Section</DrawerDialogTitle>
        </DrawerDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 flex flex-col gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              placeholder="Enter new name..."
              id="name"
              {...register("name", { required: true })}
            />
          </div>
          <DrawerDialogFooter>
            <DrawerDialogClose asChild>
              <Button type="submit">Save</Button>
            </DrawerDialogClose>
          </DrawerDialogFooter>
        </form>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
