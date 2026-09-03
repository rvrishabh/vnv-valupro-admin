import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatCardProps } from "@/types";
import { Link } from "@tanstack/react-router";

export function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  to,
  accent,
}: StatCardProps) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={accent ? "h-5 w-5 text-accent" : "h-5 w-5 text-primary"} />
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-semibold text-foreground">
            {isLoading ? <Skeleton className="h-8 w-14" /> : value}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
