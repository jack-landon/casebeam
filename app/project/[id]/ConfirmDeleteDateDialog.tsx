import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { useDeviceType } from "@/lib/deviceTypeHook";

type Props = {
  title: string;
  description: string;
  confirmDelete: () => void;
  children: React.ReactNode;
};

export function ConfirmDeleteDateDialog({
  title,
  description,
  confirmDelete,
  children,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const { isDesktop } = useDeviceType();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Button
            onClick={confirmDelete}
            type="submit"
            className="cursor-pointer"
          >
            Confirm
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <div className="flex w-full justify-between">
              <Button variant="outline">Cancel</Button>
              <Button
                onClick={confirmDelete}
                type="submit"
                className="cursor-pointer"
              >
                Confirm
              </Button>
            </div>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
