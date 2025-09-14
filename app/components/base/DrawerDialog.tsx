"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ComponentProps } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function DrawerDialog(
  props: ComponentProps<typeof Dialog> | ComponentProps<typeof Drawer>
) {
  const isMobile = useIsMobile();
  const Component = isMobile ? Drawer : Dialog;
  return <Component {...props} />;
}

export function DrawerDialogClose(props: ComponentProps<typeof DialogClose>) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerClose : DialogClose;
  return <Component {...props} />;
}

export function DrawerDialogContent(
  props:
    | ComponentProps<typeof DialogContent>
    | ComponentProps<typeof DrawerContent>
) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerContent : DialogContent;
  return <Component {...props} />;
}

export function DrawerDialogDescription(
  props: ComponentProps<typeof DialogDescription>
) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerDescription : DialogDescription;
  return <Component {...props} />;
}

export function DrawerDialogFooter(props: ComponentProps<typeof DialogFooter>) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerFooter : DialogFooter;
  return <Component {...props} />;
}

export function DrawerDialogHeader(props: ComponentProps<typeof DialogHeader>) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerHeader : DialogHeader;
  return <Component {...props} />;
}

export function DrawerDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerTitle : DialogTitle;
  return <Component {...props} />;
}

export function DrawerDialogTrigger(
  props: ComponentProps<typeof DialogTrigger>
) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerTrigger : DialogTrigger;
  return <Component {...props} />;
}
