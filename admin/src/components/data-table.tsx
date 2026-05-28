import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Download, ArrowUp, ArrowDown, ChevronsUpDown, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number | Date | null | undefined;
  hideable?: boolean;
}

interface TablePrefs {
  q: string;
  page: number;
  pageSize: number;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  hidden: string[];
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  pageSize?: number;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  /** Unique key — enables persisting prefs to localStorage. */
  storageKey?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T extends { id?: string; _id?: string }>({
  data, columns, searchKeys = [], pageSize = 10, toolbar, emptyMessage = "No records found.",
  loading, storageKey,
}: Props<T>) {
  const [prefs, setPrefs] = usePersistedState<TablePrefs>(storageKey, {
    q: "",
    page: 1,
    pageSize,
    sortKey: null,
    sortDir: "asc",
    hidden: [],
  });
  const { q, page, pageSize: ps, sortKey, sortDir, hidden } = prefs;

  // Debounce search so each keystroke doesn't re-filter the entire dataset.
  const [qInput, setQInput] = useState(q);
  useEffect(() => { setQInput(q); }, [q]);
  useEffect(() => {
    if (qInput === q) return;
    const t = setTimeout(() => setPrefs((p) => ({ ...p, q: qInput, page: 1 })), 180);
    return () => clearTimeout(t);
  }, [qInput, q, setPrefs]);

  const fake = useFakeLoading(550);
  const isLoading = loading ?? fake;

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hidden.includes(c.key)),
    [columns, hidden],
  );

  const filtered = useMemo(() => {
    let rows = data;
    if (q && searchKeys.length) {
      const ql = q.toLowerCase();
      rows = rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(ql)),
      );
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        const acc = col.sortAccessor ?? ((r: T) => (r as Record<string, unknown>)[sortKey] as string | number | Date | null | undefined);
        const dir = sortDir === "asc" ? 1 : -1;
        rows = [...rows].sort((a, b) => {
          const av = acc(a); const bv = acc(b);
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
          return 0;
        });
      }
    }
    return rows;
  }, [data, q, searchKeys, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ps));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ps;
  const rows = filtered.slice(start, start + ps);

  const update = useCallback(
    (patch: Partial<TablePrefs>) => setPrefs((p) => ({ ...p, ...patch })),
    [setPrefs],
  );

  const onSort = useCallback((col: Column<T>) => {
    if (!col.sortable) return;
    setPrefs((p) =>
      p.sortKey === col.key
        ? { ...p, sortDir: p.sortDir === "asc" ? "desc" : "asc" }
        : { ...p, sortKey: col.key, sortDir: "asc", page: 1 },
    );
  }, [setPrefs]);

  const toggleHidden = useCallback((key: string) => {
    setPrefs((p) => ({
      ...p,
      hidden: p.hidden.includes(key) ? p.hidden.filter((k) => k !== key) : [...p.hidden, key],
    }));
  }, [setPrefs]);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search…"
            className="pl-8 h-9"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          Filters <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings2 className="h-3.5 w-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={!hidden.includes(c.key)}
                onCheckedChange={() => toggleHidden(c.key)}
                onSelect={(e) => e.preventDefault()}
                disabled={c.hideable === false}
              >
                {c.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {visibleColumns.map((c) => {
                const active = sortKey === c.key;
                const Icon = !c.sortable ? null : active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
                return (
                  <TableHead
                    key={c.key}
                    className={cn(
                      "text-xs uppercase tracking-wide text-muted-foreground",
                      c.sortable && "cursor-pointer select-none transition-colors hover:text-foreground",
                      active && "text-foreground",
                      c.className,
                    )}
                    onClick={() => onSort(c)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.header}
                      {Icon && <Icon className={cn("h-3 w-3", active ? "text-primary" : "opacity-50")} />}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(ps, 6) }).map((_, i) => (
                <TableRow key={`sk-${i}`} className="hover:bg-transparent">
                  {visibleColumns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumns.length} className="h-32 text-center text-muted-foreground text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id || r._id} className="hover:bg-accent/40 focus-within:bg-accent/40">
                  {visibleColumns.map((c) => (
                    <TableCell key={c.key} className={c.className}>{c.cell(r)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 p-3 border-t text-sm text-muted-foreground flex-wrap">
        <span>
          Showing <strong className="text-foreground">{rows.length === 0 ? 0 : start + 1}–{start + rows.length}</strong> of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8">
                {ps} / page <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={String(ps)}
                onValueChange={(v) => update({ pageSize: Number(v), page: 1 })}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <DropdownMenuRadioItem key={n} value={String(n)}>{n} per page</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => update({ page: safePage - 1 })}>Previous</Button>
          <span className="px-2 text-xs">Page {safePage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={safePage === totalPages} onClick={() => update({ page: safePage + 1 })}>Next</Button>
        </div>
      </div>
    </Card>
  );
}
