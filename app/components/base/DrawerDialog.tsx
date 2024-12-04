import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tooltip } from "@/components/base/Tooltip";
import Form from "next/form";

export function DrawerDialog({
  tooltip,
  trigger,
  header,
  title,
  description,
  children,
  formAction,
}: {
  tooltip?: string;
  trigger?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  formAction?: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
}) {
  const asChild = Boolean(trigger);

  const ContentDrawer = ({ addClose }: { addClose: boolean }) => {
    return (
      <div className="flex flex-col justify-center mb-4">
        <DrawerHeader>
          {header}
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && (
            <DrawerDescription asChild={asChild}>
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <DrawerFooter> {children}</DrawerFooter>
        {addClose && (
          <DrawerClose asChild={asChild}>
            <Button type="submit">Save changes</Button>
          </DrawerClose>
        )}
      </div>
    );
  };

  const ContentDialog = ({ addClose }: { addClose: boolean }) => {
    return (
      <>
        <DialogHeader>
          {header}
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && (
            <DialogDescription asChild={asChild}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        {addClose && (
          <DialogClose asChild={asChild}>
            <Button type="submit">Save changes</Button>
          </DialogClose>
        )}
      </>
    );
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog>
        {tooltip ? (
          <Tooltip description={tooltip}>
            <DialogTrigger asChild={asChild}>{trigger}</DialogTrigger>
          </Tooltip>
        ) : (
          <DialogTrigger asChild={asChild}>{trigger}</DialogTrigger>
        )}
        {formAction ? (
          <DialogContent>
            <Form action={formAction}>
              <ContentDialog addClose />
            </Form>
          </DialogContent>
        ) : (
          <DialogContent>
            <ContentDialog addClose={false} />
          </DialogContent>
        )}
      </Dialog>
    );
  }

  return (
    <Drawer>
      {tooltip ? (
        <Tooltip description={tooltip}>
          <DrawerTrigger asChild={asChild}>{trigger}</DrawerTrigger>
        </Tooltip>
      ) : (
        <DrawerTrigger asChild={asChild}>{trigger}</DrawerTrigger>
      )}
      {formAction ? (
        <DrawerContent>
          <Form action={formAction}>
            <ContentDrawer addClose={true} />
          </Form>
        </DrawerContent>
      ) : (
        <DrawerContent>
          <ContentDrawer addClose={false} />
        </DrawerContent>
      )}
    </Drawer>
  );
}
