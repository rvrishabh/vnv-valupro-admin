import { cn } from "../lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion as BaseAccordion,
} from "./ui/accordion";

interface AccordionProps {
  items: {
    value: string;
    trigger: React.ReactNode;
    content: React.ReactNode;
  }[];
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  triggerClassName?: string;
  itemClassName?: string;
}

export default function Accordion({
  items,
  type = "single",
  collapsible = true,
  className,
  triggerClassName,
  itemClassName,
}: AccordionProps) {
  return (
    <BaseAccordion type={type} collapsible={collapsible} className={className}>
      {items.map((item) => (
        <AccordionItem
          className={itemClassName}
          key={item.value}
          value={item.value}
        >
          <AccordionTrigger
            className={(cn("text-md font-semibold"), triggerClassName)}
          >
            {item.trigger}
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </BaseAccordion>
  );
}
