import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="font-display text-6xl font-semibold text-primary">
        404
      </span>
      <h1 className="text-xl font-medium text-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-2">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
