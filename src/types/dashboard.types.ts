import type { ComponentType } from "react";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  isLoading: boolean;
  to: string;
  accent?: boolean;
}
