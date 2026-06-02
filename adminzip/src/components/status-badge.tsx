import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "danger" | "info" | "default" | "primary";

const styles: Record<Variant, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/40 dark:text-warning",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  default: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  variant = "default", children, className,
}: { variant?: Variant; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
      styles[variant], className
    )}>
      {children}
    </span>
  );
}
