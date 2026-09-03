import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-blue-100 dark:bg-blue-950/40",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
