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

export function AddNewSectionButton() {
  const { data: session } = useSession();
  const { toast } = useToast();

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
          className="h-8 sm:h-9 px-2 sm:px-3 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden gap-0"
        >
          <ListPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
          <span className="whitespace-nowrap">
            <span className="sm:inline text-[10px]">New Section</span>
          </span>
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Add New Section</DrawerDialogTitle>
        </DrawerDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = { name: formData.get("name") as string };
            onSubmit(data).catch(console.error);
          }}
        >
          <div className="p-6 flex flex-col gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              placeholder="Enter new name..."
              id="name"
              name="name"
              required
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
