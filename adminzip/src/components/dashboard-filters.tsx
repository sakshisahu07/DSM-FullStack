import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const timeFilters = [
  { id: "today", label: "Today" },
  { id: "last_7_days", label: "Last 7 Days" },
  { id: "this_month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "all_time", label: "All Time" }
];

interface DashboardFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export function DashboardFilters({ filter, onFilterChange }: DashboardFiltersProps) {
  return (
    <Card className="p-3 mb-6 bg-primary/10 dark:bg-primary/5 shadow-sm rounded-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Time Range Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {timeFilters.map((f) => {
            const isActive = filter === f.id;
            return (
              <Button
                key={f.id}
                variant="ghost"
                onClick={() => onFilterChange(f.id)}
                className={`h-11 px-6 rounded-xl font-bold transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-none hover:bg-primary/90" 
                    : "bg-background/50 text-primary dark:bg-slate-800/50 dark:text-slate-300 hover:bg-background/80 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </Button>
            );
          })}
        </div>

        {/* Right: Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Filter by Year</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] h-11 rounded-xl border-primary/20 bg-background/50 dark:bg-slate-800/50 font-medium">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
