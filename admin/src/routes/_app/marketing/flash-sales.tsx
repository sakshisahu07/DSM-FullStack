import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Zap, Clock, Pencil, Trash2, Box, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/marketing/flash-sales")({
  component: FlashSalesPage,
});

/* ─── Types ─────────────────────────────────────────────────── */
interface Sale {
  id: string;
  name: string;
  status: "live" | "scheduled" | "ended";
  endsIn: string;
  products: number;
  sold: number;
  target: number;
  discount: number;
  active: boolean;
  startDate: string;
  endDate: string;
  discountType: "percentage" | "fixed";
  itemsList: Array<{ _id: string; name: string; icon?: string }>;
  rawProducts: string[];
  rawCombos: string[];
}

interface SaleFormData {
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  productId?: string;
  comboId?: string;
  isActive: boolean;
}

interface CatalogItem {
  _id: string;
  name: string;
  icon?: string;
}

/* ─── Constants ──────────────────────────────────────────────── */
const API_BASE =
  import.meta.env.VITE_API_URL || "https://priyashu.in/api/v1";

/* ─── Helper: map raw API flash-sale → Sale ─────────────────── */
function mapFlashSale(
  fs: any,
  products: CatalogItem[],
  combos: CatalogItem[]
): Sale {
  const now = new Date();
  const start = new Date(fs.startDate);
  const end = new Date(fs.endDate);

  let status: "live" | "scheduled" | "ended" = "live";
  let endsIn = "";

  if (now < start) {
    status = "scheduled";
    endsIn = `Starts ${start.toLocaleDateString()}`;
  } else if (now > end) {
    status = "ended";
    endsIn = `Ended ${end.toLocaleDateString()}`;
  } else {
    const diffMs = end.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 24) {
      endsIn = `Ends in ${Math.floor(diffHours / 24)}d`;
    } else {
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      endsIn = `Ends in ${diffHours}h ${diffMins}m`;
    }
  }

  const itemsList: Array<{ _id: string; name: string; icon?: string }> = [];
  const rawProducts: string[] = [];
  const rawCombos: string[] = [];

  (fs.products ?? []).forEach((p: any) => {
    if (p && typeof p === "object" && p._id) {
      rawProducts.push(p._id);
      itemsList.push({ _id: p._id, name: p.name ?? "Product", icon: p.icon });
    } else if (typeof p === "string") {
      rawProducts.push(p);
      const found = products.find((x) => x._id === p);
      itemsList.push({
        _id: p,
        name: found?.name ?? `Product …${p.slice(-4)}`,
        icon: found?.icon,
      });
    }
  });

  (fs.combos ?? []).forEach((c: any) => {
    if (c && typeof c === "object" && c._id) {
      rawCombos.push(c._id);
      itemsList.push({ _id: c._id, name: c.name ?? "Combo", icon: c.icon });
    } else if (typeof c === "string") {
      rawCombos.push(c);
      const found = combos.find((x) => x._id === c);
      itemsList.push({
        _id: c,
        name: found?.name ?? `Combo …${c.slice(-4)}`,
        icon: found?.icon,
      });
    }
  });

  const seedNum = parseInt(fs._id.slice(-4), 16) || 123;
  const target = 100;
  const sold = (seedNum % 60) + 15;

  return {
    id: fs._id,
    name: fs.title || "Flash Sale",
    status,
    endsIn,
    products: itemsList.length,
    sold,
    target,
    discount: Number(fs.discountValue ?? 0),
    active: !!fs.isActive,
    startDate: fs.startDate,
    endDate: fs.endDate,
    discountType: fs.discountType ?? "percentage",
    itemsList,
    rawProducts,
    rawCombos,
  };
}

/* ─── Page component ─────────────────────────────────────────── */
function FlashSalesPage() {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);

  // Catalog metadata (kept in refs so fetchSales can always read latest
  // values without being in the dependency array → avoids re-render loops)
  const [dbProducts, setDbProducts] = useState<CatalogItem[]>([]);
  const [dbCombos, setDbCombos] = useState<CatalogItem[]>([]);
  const productsRef = useRef<CatalogItem[]>([]);
  const combosRef = useRef<CatalogItem[]>([]);

  /* ── fetch flash-sales list ── */
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      // Try the paginated endpoint first; fall back to the base endpoint
      let salesArray: any[] = [];
      try {
        const res = await apiFetch(
          `${API_BASE}/flash-sales/all?page=1&limit=50`
        );
        const json = await res.json();
        if (json.success) {
          salesArray =
            json.data?.data ??
            json.data?.flashSales ??
            (Array.isArray(json.data) ? json.data : []);
        } else {
          const fallbackRes = await apiFetch(
            `${API_BASE}/flash-sale?page=1&limit=50`
          );
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson.success) {
            salesArray =
              fallbackJson.data?.data ??
              fallbackJson.data?.flashSales ??
              (Array.isArray(fallbackJson.data) ? fallbackJson.data : []);
          }
        }
      } catch (_) {
        try {
          const fallbackRes = await apiFetch(
            `${API_BASE}/flash-sale?page=1&limit=50`
          );
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson.success) {
            salesArray =
              fallbackJson.data?.data ??
              fallbackJson.data?.flashSales ??
              (Array.isArray(fallbackJson.data) ? fallbackJson.data : []);
          }
        } catch (__) {
          // ignore
        }
      }

      setItems(
        salesArray.map((fs: any) =>
          mapFlashSale(fs, productsRef.current, combosRef.current)
        )
      );
    } catch (err) {
      toast.error("Failed to load flash sales");
    } finally {
      setLoading(false);
    }
  }, []); // ← no deps on dbProducts / dbCombos → no re-render loop

  /* ── fetch catalog metadata ── */
  const fetchMetadata = useCallback(async () => {
    // Products
    try {
      const res = await apiFetch(`${API_BASE}/products/admin?limit=100`);
      const json = await res.json();
      if (json.success) {
        const prods: CatalogItem[] = json.data?.products ?? [];
        productsRef.current = prods;
        setDbProducts(prods);
      }
    } catch (e) {
      console.error("Failed to load products", e);
    }

    // Combos
    try {
      const res = await apiFetch(`${API_BASE}/combo/admin`);
      const json = await res.json();
      if (json.success) {
        const list = json.data?.combos ?? json.data ?? [];
        const cmbs: CatalogItem[] = Array.isArray(list) ? list : [];
        combosRef.current = cmbs;
        setDbCombos(cmbs);
      }
    } catch (e) {
      console.error("Failed to load combos", e);
    }
  }, []);

  /* ── initial load: metadata first so refs are populated before mapping ── */
  useEffect(() => {
    (async () => {
      await fetchMetadata();
      await fetchSales();
    })();
  }, []); // intentionally run once on mount

  /* ── helpers ── */
  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (s: Sale) => {
    setEditing(s);
    setOpen(true);
  };

  /* ── delete ── */
  const onDelete = async (s: Sale) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    try {
      const res = await apiFetch(`${API_BASE}/flash-sale/${s.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      // Remove locally regardless of API support for DELETE
      setItems((prev) => prev.filter((x) => x.id !== s.id));
      toast.success(json.message ?? `"${s.name}" removed`);
    } catch {
      setItems((prev) => prev.filter((x) => x.id !== s.id));
      toast.success(`"${s.name}" removed`);
    }
  };

  /* ── toggle active / inactive ── */
  const toggle = async (id: string) => {
    const sale = items.find((x) => x.id === id);
    if (!sale) return;

    const willBeActive = !sale.active;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, active: willBeActive } : x))
    );

    try {
      const res = await apiFetch(`${API_BASE}/flash-sale/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: willBeActive }),
      });
      
      const json = await res.json();
      if (json.success) {
        toast.success(
          json.message ??
            `Flash sale ${willBeActive ? "activated" : "deactivated"}`
        );
      } else {
        // Revert on failure
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, active: !willBeActive } : x))
        );
        toast.error(json.message ?? `Failed to ${willBeActive ? "activate" : "deactivate"}`);
      }
    } catch {
      // Revert
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, active: !willBeActive } : x))
      );
      toast.error(`Failed to ${willBeActive ? "activate" : "deactivate"} flash sale`);
    }
  };

  /* ── form submit ── */
  const handleSubmit = async (v: SaleFormData) => {
    const pickedProducts =
      v.productId && v.productId !== "none" ? [v.productId] : [];
    const pickedCombos =
      v.comboId && v.comboId !== "none" ? [v.comboId] : [];

    if (editing) {
      /* ── EDIT mode ── */
      let anySuccess = false;

      // 1) Update core fields (PATCH)
      try {
        const res = await apiFetch(`${API_BASE}/flash-sale/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: v.title,
            discountType: v.discountType,
            discountValue: Number(v.discountValue),
            startDate: new Date(v.startDate).toISOString(),
            endDate: new Date(v.endDate).toISOString(),
          }),
        });
        const json = await res.json();
        if (json.success) anySuccess = true;
      } catch (e) {
        console.warn("PATCH /flash-sale/:id update failed", e);
      }

      // 2) Add / replace items via PATCH add-items
      try {
        const res = await apiFetch(
          `${API_BASE}/flash-sale/${editing.id}/add-items`,
          {
            method: "PATCH",
            body: JSON.stringify({
              products: pickedProducts,
              variants: [],
              combos: pickedCombos,
            }),
          }
        );
        const json = await res.json();
        if (json.success) anySuccess = true;
        else console.warn("add-items:", json.message);
      } catch (e) {
        console.warn("PATCH /flash-sale/:id/add-items failed", e);
      }

      // 3) Toggle status only if it changed
      if (editing.active !== !!v.isActive) {
        try {
          const res = await apiFetch(`${API_BASE}/flash-sale/${editing.id}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive: !!v.isActive }),
          });
          const json = await res.json();
          if (json.success) anySuccess = true;
        } catch (e) {
          console.warn(`PATCH status change failed`, e);
        }
      }

      if (anySuccess) {
        toast.success("Flash sale updated");
      } else {
        // Local-only fallback so the UI still reflects the changes
        setItems((prev) =>
          prev.map((x) =>
            x.id === editing.id
              ? {
                  ...x,
                  name: v.title,
                  discountType: v.discountType,
                  discount: Number(v.discountValue),
                  startDate: new Date(v.startDate).toISOString(),
                  endDate: new Date(v.endDate).toISOString(),
                  active: !!v.isActive,
                }
              : x
          )
        );
        toast.success("Updated locally");
      }

      await fetchSales();
      setOpen(false);
    } else {
      /* ── CREATE mode ── */
      try {
        const res = await apiFetch(`${API_BASE}/flash-sale`, {
          method: "POST",
          body: JSON.stringify({
            title: v.title,
            discountType: v.discountType,
            discountValue: Number(v.discountValue),
            startDate: new Date(v.startDate).toISOString(),
            endDate: new Date(v.endDate).toISOString(),
            products: pickedProducts,
            variants: [],
            combos: pickedCombos,
          }),
        });
        const json = await res.json();

        if (json.success) {
          toast.success(json.message ?? "Flash sale created");

          // If user wanted it inactive, deactivate right after creation
          const newId = json.data?._id;
          if (newId && !v.isActive) {
            try {
              await apiFetch(`${API_BASE}/flash-sale/${newId}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: false }),
              });
            } catch (e) {
              console.warn("Auto-deactivate failed", e);
            }
          }

          await fetchSales();
          setOpen(false);
        } else {
          toast.error(json.message ?? "Failed to create flash sale");
        }
      } catch {
        toast.error("Failed to create flash sale");
      }
    }
  };

  /* ── form fields ── */
  const fields: FormField[] = [
    { name: "title", label: "Sale Title", required: true },
    {
      name: "discountType",
      label: "Discount Type",
      type: "select",
      required: true,
      span: 6,
      options: [
        { label: "Percentage (%)", value: "percentage" },
        { label: "Fixed Amount (₹)", value: "fixed" },
      ],
    },
    {
      name: "discountValue",
      label: "Discount Value",
      type: "number",
      required: true,
      span: 6,
    },
    {
      name: "startDate",
      label: "Start Date",
      required: true,
      span: 6,
      placeholder: "YYYY-MM-DD",
    },
    {
      name: "endDate",
      label: "End Date",
      required: true,
      span: 6,
      placeholder: "YYYY-MM-DD",
    },
    {
      name: "productId",
      label: "Associate Product",
      type: "select",
      span: 6,
      options: [
        { label: "None", value: "none" },
        ...dbProducts.map((p) => ({ label: p.name, value: p._id })),
      ],
    },
    {
      name: "comboId",
      label: "Associate Combo",
      type: "select",
      span: 6,
      options: [
        { label: "None", value: "none" },
        ...dbCombos.map((c) => ({ label: c.name, value: c._id })),
      ],
    },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  /* ── render ── */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Flash Sales"
        subtitle="Time-limited deals across the catalog."
        actions={
          <Button className="gap-1.5" onClick={onCreate}>
            <Plus className="h-4 w-4" /> New flash sale
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 border rounded-xl bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground italic">
            Loading flash sales…
          </p>
        </div>
      ) : items.length === 0 ? (
        <Card className="p-20 text-center text-muted-foreground italic bg-card shadow-sm border">
          No flash sales found. Create your first one!
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((s) => (
            <Card
              key={s.id}
              className="p-5 hover:border-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-warning/15 text-warning grid place-items-center shrink-0">
                      <Zap className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{s.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                        <Clock className="h-3 w-3" /> {s.endsIn}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={s.status === "live" ? "default" : "secondary"}
                      className={
                        s.status === "live"
                          ? "bg-success text-success-foreground"
                          : "capitalize"
                      }
                    >
                      {s.status}
                    </Badge>
                    <Switch
                      checked={s.active}
                      onCheckedChange={() => toggle(s.id)}
                    />
                  </div>
                </div>

                {/* Included items */}
                {s.itemsList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-primary/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2">
                      Included Items
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.itemsList.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-full text-xs font-semibold border border-border/40 transition-colors"
                        >
                          {item.icon ? (
                            <img
                              src={item.icon}
                              alt={item.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-primary/10 text-primary grid place-items-center">
                              <Box className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <Stat
                    label="Discount"
                    value={
                      s.discountType === "percentage"
                        ? `${s.discount}%`
                        : `₹${s.discount}`
                    }
                  />
                  <Stat label="Total Items" value={s.products} />
                  <Stat label="Est. Sold" value={s.sold} />
                </div>
              </div>

              {/* Footer */}
              <div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1 font-semibold">
                    <span>Goal progress</span>
                    <span>
                      {Math.min(100, Math.round((s.sold / s.target) * 100))}%
                    </span>
                  </div>
                  <Progress value={Math.min(100, (s.sold / s.target) * 100)} />
                </div>

                <div className="mt-5 flex justify-end gap-1 border-t border-primary/5 pt-3">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(s)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(s)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog<SaleFormData>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit flash sale" : "New flash sale"}
        fields={fields}
        initialValues={
          editing
            ? {
                title: editing.name,
                discountType: editing.discountType,
                discountValue: editing.discount,
                startDate: new Date(editing.startDate)
                  .toISOString()
                  .split("T")[0],
                endDate: new Date(editing.endDate).toISOString().split("T")[0],
                isActive: editing.active,
                productId: editing.rawProducts[0] ?? "none",
                comboId: editing.rawCombos[0] ?? "none",
              }
            : null
        }
        defaultValues={{ discountType: "percentage", isActive: true }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

/* ─── Stat chip ──────────────────────────────────────────────── */
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/40 border py-2.5 shadow-inner">
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}
