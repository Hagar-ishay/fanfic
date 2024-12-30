"use client";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { getSectionByNameUser, insertSection } from "@/db/sections";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { ListPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogFooter,
  DrawerDialogClose,
} from "@/components/base/DrawerDialog";

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ displayName: string; name: string }>();
  const [isPending, startTransition] = useTransition();
  const [shouldAddSection, setShouldAddSection] = useState(false);
  const [nameEdited, setNameEdited] = useState(false);

  if (!user) {
    return null;
  }

  const onSubmit = async (data: { displayName: string; name: string }) => {
    const title = "Add Section";
    startTransition(async () => {
      try {
        await insertSection({
          name: data.name,
          displayName: data.displayName,
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
    });
  };

  const validateName = async (name: string) => {
    const isExists = await getSectionByNameUser(user.id, name);
    return !isExists.length;
  };

  const displayName = watch("displayName");

  return (
    <>
      <Tooltip description="Add new Section">
        <Button
          className="w-10"
          size="icon"
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
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                {...register("displayName", { required: true })}
                onChange={(e) => {
                  !nameEdited && setValue("name", e.target.value);
                }}
              />
              {errors.displayName && <span>This field is required</span>}
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                className="border-primary"
                id="name"
                {...register("name", {
                  required: true,
                  validate: validateName,
                  onChange: () => {
                    setNameEdited(true);
                  },
                })}
              />
              {errors.name && (
                <div>
                  {errors.name.type === "validate"
                    ? "Name already exists"
                    : "This field is required"}
                </div>
              )}
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
