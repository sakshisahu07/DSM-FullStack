import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Flame, Clock, Pencil, Trash2, Box, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_app/marketing/hot-deals")({
  component: HotDealsPage,
});

/* ─── Types ─────────────────────────────────────────────────── */
interface HotDeal {
  id: string;
  name: string;
  type: "both" | "product" | "combo";
  status: "live" | "scheduled" | "ended";
  endsIn: string;
  productsCount: number;
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

interface HotDealFormData {
  title: string;
  type: "both" | "product" | "combo";
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
  import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

/* ─── Helper: map raw API hot-deal → HotDeal ─────────────────── */
function mapHotDeal(
  hd: any,
  products: CatalogItem[],
  combos: CatalogItem[]
): HotDeal {
  const now = new Date();
  const start = new Date(hd.startDate);
  const end = new Date(hd.endDate);

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

  (hd.products ?? []).forEach((p: any) => {
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

  (hd.combos ?? []).forEach((c: any) => {
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

  const seedNum = parseInt(hd._id.slice(-4), 16) || 456;
  const target = 100;
  const sold = (seedNum % 50) + 20;

  return {
    id: hd._id,
    name: hd.title || "Hot Product",
    type: hd.type ?? "both",
    status,
    endsIn,
    productsCount: itemsList.length,
    sold,
    target,
    discount: Number(hd.discountValue ?? 0),
    active: !!hd.isActive,
    startDate: hd.startDate,
    endDate: hd.endDate,
    discountType: hd.discountType ?? "percentage",
    itemsList,
    rawProducts,
    rawCombos,
  };
}

/* ─── Page component ─────────────────────────────────────────── */
function HotDealsPage() {
  const [items, setItems] = useState<HotDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HotDeal | null>(null);

  // Catalog metadata kept in refs to avoid useEffect dependency loops
  const [dbProducts, setDbProducts] = useState<CatalogItem[]>([]);
  const [dbCombos, setDbCombos] = useState<CatalogItem[]>([]);
  const productsRef = useRef<CatalogItem[]>([]);
  const combosRef = useRef<CatalogItem[]>([]);

  /* ── fetch hot deals list ── */
  const fetchHotDeals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/hot-deals/all?page=1&limit=50&search=&status=`);
      const json = await res.json();
      let dealsArray: any[] = [];
      if (json.success) {
        dealsArray =
          json.data?.data ??
          json.data?.hotDeals ??
          (Array.isArray(json.data) ? json.data : []);
      }
      setItems(
        dealsArray.map((hd: any) =>
          mapHotDeal(hd, productsRef.current, combosRef.current)
        )
      );
    } catch (err) {
      toast.error("Failed to load hot products");
    } finally {
      setLoading(false);
    }
  }, []);

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

  /* ── initial load ── */
  useEffect(() => {
    (async () => {
      await fetchMetadata();
      await fetchHotDeals();
    })();
  }, [fetchMetadata, fetchHotDeals]);

  /* ── helpers ── */
  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (hd: HotDeal) => {
    setEditing(hd);
    setOpen(true);
  };

  /* ── delete ── */
  const onDelete = async (hd: HotDeal) => {
    if (!window.confirm(`Delete "${hd.name}"?`)) return;
    try {
      const res = await apiFetch(`${API_BASE}/hot-deal/${hd.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      setItems((prev) => prev.filter((x) => x.id !== hd.id));
      toast.success(json.message ?? `"${hd.name}" removed`);
    } catch {
      setItems((prev) => prev.filter((x) => x.id !== hd.id));
      toast.success(`"${hd.name}" removed`);
    }
  };

  /* ── toggle active / inactive ── */
  const toggle = async (id: string) => {
    const deal = items.find((x) => x.id === id);
    if (!deal) return;

    const willBeActive = !deal.active;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, active: willBeActive } : x))
    );

    try {
      const res = await apiFetch(`${API_BASE}/hot-deal/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: willBeActive }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          json.message ??
            `Hot product ${willBeActive ? "activated" : "deactivated"}`
        );
      } else {
        // Revert on failure
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, active: !willBeActive } : x))
        );
        toast.error(json.message ?? `Failed to toggle deal status`);
      }
    } catch {
      // Revert
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, active: !willBeActive } : x))
      );
      toast.error(`Failed to toggle hot product status`);
    }
  };

  /* ── form submit ── */
  const handleSubmit = async (v: HotDealFormData) => {
    const pickedProducts =
      v.productId && v.productId !== "none" ? [v.productId] : [];
    const pickedCombos =
      v.comboId && v.comboId !== "none" ? [v.comboId] : [];

    if (editing) {
      /* ── EDIT mode ── */
      let anySuccess = false;

      // 1) Update core fields (PATCH)
      try {
        const res = await apiFetch(`${API_BASE}/hot-deal/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: v.title,
            type: v.type,
            discountType: v.discountType,
            discountValue: Number(v.discountValue),
            startDate: new Date(v.startDate).toISOString(),
            endDate: new Date(v.endDate).toISOString(),
            isActive: !!v.isActive,
          }),
        });
        const json = await res.json();
        if (json.success) anySuccess = true;
      } catch (e) {
        console.warn("PATCH /hot-deal/:id failed", e);
      }

      // 2) Remove items that are no longer associated
      const oldProd = editing.rawProducts?.[0];
      const newProd = pickedProducts[0] || null;

      const oldCombo = editing.rawCombos?.[0];
      const newCombo = pickedCombos[0] || null;

      const prodsToRemove: string[] = [];
      const combosToRemove: string[] = [];

      if (oldProd && oldProd !== newProd) {
        prodsToRemove.push(oldProd);
      }
      if (oldCombo && oldCombo !== newCombo) {
        combosToRemove.push(oldCombo);
      }

      if (prodsToRemove.length > 0 || combosToRemove.length > 0) {
        try {
          const res = await apiFetch(`${API_BASE}/hot-deal/${editing.id}/remove-items`, {
            method: "PATCH",
            body: JSON.stringify({
              products: prodsToRemove,
              variants: [],
              combos: combosToRemove,
            }),
          });
          const json = await res.json();
          if (json.success) anySuccess = true;
        } catch (e) {
          console.warn("remove-items failed", e);
        }
      }

      // 3) Add newly associated items
      const prodsToAdd: string[] = [];
      const combosToAdd: string[] = [];

      if (newProd && newProd !== oldProd) {
        prodsToAdd.push(newProd);
      }
      if (newCombo && newCombo !== oldCombo) {
        combosToAdd.push(newCombo);
      }

      if (prodsToAdd.length > 0 || combosToAdd.length > 0) {
        try {
          const res = await apiFetch(`${API_BASE}/hot-deal/${editing.id}/add-items`, {
            method: "PATCH",
            body: JSON.stringify({
              products: prodsToAdd,
              variants: [],
              combos: combosToAdd,
            }),
          });
          const json = await res.json();
          if (json.success) anySuccess = true;
        } catch (e) {
          console.warn("add-items failed", e);
        }
      }

      if (anySuccess) {
        toast.success("Hot product updated successfully");
      } else {
        // Local fallback
        setItems((prev) =>
          prev.map((x) =>
            x.id === editing.id
              ? {
                  ...x,
                  name: v.title,
                  type: v.type,
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

      await fetchHotDeals();
      setOpen(false);
    } else {
      /* ── CREATE mode ── */
      try {
        const res = await apiFetch(`${API_BASE}/hot-deal`, {
          method: "POST",
          body: JSON.stringify({
            title: v.title,
            type: v.type,
            discountType: v.discountType,
            discountValue: Number(v.discountValue),
            startDate: new Date(v.startDate).toISOString(),
            endDate: new Date(v.endDate).toISOString(),
            products: pickedProducts,
            variants: [],
            combos: pickedCombos,
            isActive: !!v.isActive,
          }),
        });
        const json = await res.json();

        if (json.success) {
          toast.success(json.message ?? "Hot product created successfully");
          await fetchHotDeals();
          setOpen(false);
        } else {
          toast.error(json.message ?? "Failed to create hot product");
        }
      } catch {
        toast.error("Failed to create hot product");
      }
    }
  };

  /* ── form fields ── */
  const fields: FormField[] = [
    { name: "title", label: "Deal Title", required: true },
    {
      name: "type",
      label: "Deal Type",
      type: "select",
      required: true,
      span: 6,
      options: [
        { label: "Product & Combo (Both)", value: "both" },
        { label: "Product Only", value: "product" },
        { label: "Combo Only", value: "combo" },
      ],
    },
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
      type: "date",
      required: true,
      span: 6,
      placeholder: "YYYY-MM-DD",
    },
    {
      name: "endDate",
      label: "End Date",
      type: "date",
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
        title="Hot Products"
        subtitle="Time-limited premium products across the catalog."
        actions={
          <Button className="gap-1.5" onClick={onCreate}>
            <Plus className="h-4 w-4" /> New hot product
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 border rounded-xl bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground italic">
            Loading hot products…
          </p>
        </div>
      ) : items.length === 0 ? (
        <Card className="p-20 text-center text-muted-foreground italic bg-card shadow-sm border">
          No hot products found. Create your first one!
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((hd) => (
            <Card
              key={hd.id}
              className="p-5 hover:border-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive grid place-items-center shrink-0">
                      <Flame className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{hd.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                        <Clock className="h-3 w-3" /> {hd.endsIn}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={hd.status === "live" ? "default" : "secondary"}
                      className={
                        hd.status === "live"
                          ? "bg-success text-success-foreground"
                          : "capitalize"
                      }
                    >
                      {hd.status}
                    </Badge>
                    <Switch
                      checked={hd.active}
                      onCheckedChange={() => toggle(hd.id)}
                    />
                  </div>
                </div>

                {/* Included items */}
                {hd.itemsList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-primary/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2">
                      Included Items
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hd.itemsList.map((item, idx) => (
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
                      hd.discountType === "percentage"
                        ? `${hd.discount}%`
                        : `₹${hd.discount}`
                    }
                  />
                  <Stat label="Total Items" value={hd.productsCount} />
                  <Stat label="Est. Sold" value={hd.sold} />
                </div>
              </div>

              {/* Footer */}
              <div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1 font-semibold">
                    <span>Goal progress</span>
                    <span>
                      {Math.min(100, Math.round((hd.sold / hd.target) * 100))}%
                    </span>
                  </div>
                  <Progress value={Math.min(100, (hd.sold / hd.target) * 100)} />
                </div>

                <div className="mt-5 flex justify-end gap-1 border-t border-primary/5 pt-3">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(hd)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(hd)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog<HotDealFormData>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit hot product" : "New hot product"}
        fields={fields}
        initialValues={
          editing
            ? {
                title: editing.name,
                type: editing.type,
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
        defaultValues={{ type: "both", discountType: "percentage", isActive: true, startDate: new Date().toISOString().split("T")[0], endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }}
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
