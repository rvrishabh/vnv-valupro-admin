import type { ClassValue } from "clsx";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";

import { Separator } from "./ui/separator";

interface ModalProps extends React.ComponentProps<typeof Dialog> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  disableClose?: boolean;
  className?: ClassValue;
}

export const Modal = ({
  trigger,
  children,
  title,
  description,
  className,
  footer,
  disableClose,
  ...props
}: ModalProps) => (
  <Dialog {...props}>
    {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : <></>}

    <DialogContent
      {...(disableClose ? { "data-disable-close": true } : {})}
      className={cn(
        "h-full max-h-[92vh] max-w-screen-md md:h-max pb-8 px-0 pt-2 z-50",
        className
      )}
    >
      <DialogHeader className="px-4 pt-4">
        {title ? <DialogTitle>{title}</DialogTitle> : <></>}

        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : (
          <></>
        )}
      </DialogHeader>
      <Separator />
      <div className="px-4">{children}</div>
      {footer ? <DialogFooter className="px-4">{footer}</DialogFooter> : null}
    </DialogContent>
  </Dialog>
);
