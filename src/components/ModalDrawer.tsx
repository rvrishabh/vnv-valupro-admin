import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./ui/drawer";
import { IconX } from "@tabler/icons-react";
import { Separator } from "./ui/separator";

interface ModalDrawerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  open: boolean; // Add open prop
  onClose: () => void; // Add onClose prop
}

const ModalDrawer: React.FC<ModalDrawerProps> = ({
  title,
  description,
  children,
  open,
  onClose,
}) => {
  return (
    <Drawer dismissible={false} open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full relative">
          <DrawerClose asChild>
            <div
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              onClick={onClose}
            >
              <IconX />
            </div>
          </DrawerClose>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <Separator />
          <div>{children}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ModalDrawer;
