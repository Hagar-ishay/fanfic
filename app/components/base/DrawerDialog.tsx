"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
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
  props: ComponentProps<typeof DialogClose> | ComponentProps<typeof DrawerClose>
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
    | ComponentProps<typeof DrawerDescription>
) {
  const Component = isDesktop() ? DialogDescription : DrawerDescription;
  return <Component {...props} />;
}

export function DrawerDialogFooter(
  props:
    | ComponentProps<typeof DialogFooter>
    | ComponentProps<typeof DrawerFooter>
) {
  const Component = isDesktop() ? DialogFooter : DrawerFooter;
  return <Component {...props} />;
}

export function DrawerDialogHeader(
  props:
    | ComponentProps<typeof DialogHeader>
    | ComponentProps<typeof DrawerHeader>
) {
  const Component = isDesktop() ? DialogHeader : DrawerHeader;
  return <Component {...props} />;
}

export function DrawerDialogTitle(
  props: ComponentProps<typeof DialogTitle> | ComponentProps<typeof DrawerTitle>
) {
  const Component = isDesktop() ? DialogTitle : DrawerTitle;
  return <Component {...props} />;
}

export function DrawerDialogTrigger(
  props:
    | ComponentProps<typeof DialogTrigger>
    | ComponentProps<typeof DrawerTrigger>
) {
  const Component = isDesktop() ? DialogTrigger : DrawerTrigger;
  return <Component {...props} />;
}
