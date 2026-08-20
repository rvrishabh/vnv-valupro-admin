/**
 * Prisma returns Decimal columns as strings over JSON, so numeric report fields
 * arrive as `string | number | null` and need coercing before formatting.
 */
export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(value: string | number | null | undefined): string {
  const num = toNumber(value);
  return num === null ? "—" : inrFormatter.format(num);
}

export function formatArea(value: string | number | null | undefined): string {
  const num = toNumber(value);
  return num === null ? "—" : `${num.toLocaleString("en-IN")} Sq.m`;
}

export const VALUATION_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};
