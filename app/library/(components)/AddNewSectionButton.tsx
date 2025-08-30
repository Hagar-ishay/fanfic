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
import logger from "@/logger";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertSection } from "@/db/sections";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/utils";
import { ListPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

export function AddNewSectionButton() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { register, handleSubmit } = useForm<{ name: string }>();

  if (!session) {
    return null;
  }

  const onSubmit = async (data: { name: string }) => {
    const title = "Add Section";
    try {
      await insertSection({
        name: data.name,
        userId: session.user.id,
      });
      toast({ title, description: "Added Successfully!" });
    } catch (err) {
      const error = errorMessage(err);
      logger.error(err);
      toast({ title, description: error, variant: "destructive" });
    }
  };

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>
        <Button
          size="default"
          variant="default"
          className="h-9 px-3 shadow-sm hover:shadow-md transition-all duration-200 bg-primary hover:bg-primary/90"
        >
          <ListPlus className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">New Section</span>
        </Button>
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
