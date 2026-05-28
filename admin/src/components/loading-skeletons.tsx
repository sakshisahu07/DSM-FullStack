import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Grid of generic content cards (icon + 2 text lines). */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5 space-y-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </Card>
      ))}
    </div>
  );
}

/** Row of KPI/stat tiles. */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}

/** Generic table-like skeleton for non-DataTable surfaces. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="border-b p-4 flex items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="ml-auto h-9 w-28" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-3 p-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((__, c) => (
              <Skeleton key={c} className="h-4 w-full max-w-[180px]" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Page-level skeleton: header + stats + content. */
export function PageSkeleton({ stats = 4, cards = 6 }: { stats?: number; cards?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <StatsSkeleton count={stats} />
      <CardGridSkeleton count={cards} />
    </div>
  );
}

/** Form/detail skeleton. */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <Card className="p-6 space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-28" />
      </div>
    </Card>
  );
}
