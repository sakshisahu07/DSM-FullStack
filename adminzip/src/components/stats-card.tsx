import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "primary" | "warning" | "danger" | "success";
}

const toneStyles: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-card border-border",
  primary: "bg-primary/10 border-primary/20",
  warning: "bg-warning/10 border-warning/20",
  danger: "bg-destructive/10 border-destructive/20",
  success: "bg-success/10 border-success/20",
};

const toneIcon: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/20 text-primary",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  success: "bg-success/20 text-success",
};

export function StatsCard({ label, value, change, icon: Icon, hint, tone = "default" }: Props) {
  const positive = (change ?? 0) >= 0;
  return (
    <Card className={cn("p-4 flex flex-col gap-3 hover:shadow-md transition-all border shadow-sm", toneStyles[tone])}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className={cn("h-8 w-8 rounded-md grid place-items-center", toneIcon[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="flex items-center gap-2 text-xs">
        {typeof change === "number" && (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
            positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          )}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
