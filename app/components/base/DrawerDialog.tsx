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
import { getIsDesktop } from "@/lib/utils";

const isDesktop = () => getIsDesktop()

export function DrawerDialog(
  props: ComponentProps<typeof Dialog> | ComponentProps<typeof Drawer>
) {
  const Component = isDesktop() ? Dialog : Drawer;
  return <Component {...props} />;
}

export function DrawerDialogClose(
  props: ComponentProps<typeof DialogClose>  
) {
  const Component = isDesktop() ? DialogClose : DrawerClose;
  return <Component {...props} />;
}

export function DrawerDialogContent(
  props:
    | ComponentProps<typeof DialogContent>
    | ComponentProps<typeof DrawerContent>
) {
  const Component = isDesktop() ? DialogContent : DrawerContent;
  return <Component {...props} />;
}

export function DrawerDialogDescription(
  props:
    | ComponentProps<typeof DialogDescription>
     
) {
  const Component = isDesktop() ? DialogDescription : DrawerDescription;
  return <Component {...props} />;
}

export function DrawerDialogFooter(
  props:
    | ComponentProps<typeof DialogFooter>
     
) {
  const Component = isDesktop() ? DialogFooter : DrawerFooter;
  return <Component {...props} />;
}

export function DrawerDialogHeader(
  props:
    | ComponentProps<typeof DialogHeader>
     
) {
  const Component = isDesktop() ? DialogHeader : DrawerHeader;
  return <Component {...props} />;
}

export function DrawerDialogTitle(
  props: ComponentProps<typeof DialogTitle>  
) {
  const Component = isDesktop() ? DialogTitle : DrawerTitle;
  return <Component {...props} />;
}

export function DrawerDialogTrigger(
  props:
    | ComponentProps<typeof DialogTrigger>
     
) {
  const Component = isDesktop() ? DialogTrigger : DrawerTrigger;
  return <Component {...props} />;
}
