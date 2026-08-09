import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface TooltipHelperProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export function TooltipHelper({ trigger, children }: TooltipHelperProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger type="button">{trigger}</TooltipTrigger>
        <TooltipContent className="bg-foreground/80 text-background">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
