import React from "react";
import { Separator } from "./ui/separator";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  Sheet as SheetPrimitive,
  SheetTitle,
} from "./ui/sheet";

interface SheetProps {
  title: string;
  description: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  side?: "top" | "right" | "bottom" | "left";
}

const Sheet: React.FC<SheetProps> = ({
  title,
  description,
  children,
  open,
  onClose,
  side = "right",
}) => {
  return (
    <SheetPrimitive open={open} onOpenChange={onClose}>
      <SheetContent side={side} className="overflow-visible z-[60]">
        <div className="mx-auto w-full relative">
          <SheetClose asChild>
            <div
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              onClick={onClose}
            ></div>
          </SheetClose>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <Separator />
          <div className="relative">{children}</div>
        </div>
      </SheetContent>
    </SheetPrimitive>
  );
};

export default Sheet;
