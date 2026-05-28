import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center text-center gap-3 border-dashed bg-muted/20",
        compact ? "p-6" : "p-10",
        className,
      )}
    >
      <div className="relative h-14 w-14 rounded-full bg-primary/10 grid place-items-center text-primary ring-8 ring-primary/5">
        <Icon className="h-6 w-6" />
      </div>
      <div className="font-semibold text-base">{title}</div>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </Card>
  );
}
