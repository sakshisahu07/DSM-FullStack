import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Award, Plus, Pencil, Trash2, ListTree } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/affiliate/commission-tiers")({
  component: TiersPage,
});

const fields: FormField[] = [
  { name: "name", label: "Tier name", required: true, span: 6 },
  { name: "minSales", label: "Min sales / month", type: "number", required: true, span: 6 },
  { name: "commissionType", label: "Commission Type", type: "select", options: [{label: "Flat (₹)", value: "flat"}, {label: "Percentage (%)", value: "percentage"}], required: true, span: 6 },
  { name: "commissionAmount", label: "Commission Amount", type: "number", required: true, span: 6 },
  { name: "maxCap", label: "Max Cap (for %)", type: "number", span: 12 },
  { name: "benefits", label: "Benefits (comma separated)", type: "textarea", required: true },
  { name: "isActive", label: "Active", type: "switch" },
];

const colors = [
  "#d97706", // amber-600
  "#475569", // slate-600
  "#eab308", // yellow-500
  "#7c3aed", // violet-600
  "#0f766e", // teal-700
];

function CategoryOverridesDialog({ open, onOpenChange, tier, onSaved }: { open: boolean, onOpenChange: (o: boolean)=>void, tier: any, onSaved: (t:any)=>void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  
  // local form state
  const [selCat, setSelCat] = useState("");
  const [ctype, setCtype] = useState("percentage");
  const [camount, setCamount] = useState("");
  const [cmax, setCmax] = useState("");

  useEffect(() => {
    if (open) {
      apiClient.get("/categories").then(res => setCategories(res.data?.data || []));
      setOverrides(tier?.categories || []);
      setSelCat("");
      setCtype("percentage");
      setCamount("");
      setCmax("");
    }
  }, [open, tier]);

  const handleAdd = () => {
    if (!selCat || !camount) return;
    const newO = {
      categoryId: selCat,
      commissionType: ctype,
      commissionAmount: Number(camount),
      maxCap: cmax ? Number(cmax) : null
    };
    // remove existing if any
    const filtered = overrides.filter(o => o.categoryId !== selCat);
    setOverrides([...filtered, newO]);
    setSelCat("");
    setCamount("");
    setCmax("");
  };

  const handleRemove = (cid: string) => {
    setOverrides(overrides.filter(o => o.categoryId !== cid));
  };

  const handleSave = async () => {
    try {
      const payload = { categories: overrides };
      const res = await apiClient.patch(`/affiliate/admin/tiers/${tier._id}`, payload);
      if (res.data.success) {
        toast.success("Category overrides saved");
        onSaved(res.data.data); // Return updated tier
        onOpenChange(false);
      } else {
        toast.error(res.data.message || "Failed to save");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  if (!tier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Category Overrides for {tier.name}</DialogTitle>
          <DialogDescription>Set specific commissions for different product categories.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-3 rounded-md border">
           <div className="col-span-4 space-y-1">
              <label className="text-xs font-medium">Category</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={selCat} onChange={e=>setSelCat(e.target.value)}>
                <option value="">Select...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
           </div>
           <div className="col-span-3 space-y-1">
              <label className="text-xs font-medium">Type</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={ctype} onChange={e=>setCtype(e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
           </div>
           <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium">Amount</label>
              <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={camount} onChange={e=>setCamount(e.target.value)} placeholder="0" />
           </div>
           <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium">Max Cap</label>
              <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={cmax} onChange={e=>setCmax(e.target.value)} placeholder="₹" disabled={ctype==='flat'} />
           </div>
           <div className="col-span-1 pb-0.5">
             <Button size="icon" onClick={handleAdd} disabled={!selCat || !camount}><Plus className="h-4 w-4"/></Button>
           </div>
        </div>

        <div className="mt-4 space-y-2">
          {overrides.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No overrides configured.</div>}
          {overrides.map((o, i) => {
            const cat = categories.find(c => c._id === o.categoryId);
            return (
              <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                <div className="font-medium text-sm">{cat ? cat.title : o.categoryId}</div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{o.commissionType === 'percentage' ? `${o.commissionAmount}%` : `₹${o.commissionAmount}`}</span>
                  {o.commissionType === 'percentage' && o.maxCap ? <span className="text-muted-foreground text-xs">(Max ₹{o.maxCap})</span> : null}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={()=>handleRemove(o.categoryId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Overrides</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TiersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryTier, setCategoryTier] = useState<any | null>(null);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/affiliate/admin/tiers");
      if (res.data.success) {
        setItems(res.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to load tiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const onCreate = () => { setEditing(null); setOpen(true); };
  
  const onEdit = (t: any) => { 
    // Format benefits array back to comma separated string for the form
    const formValues = {
      ...t,
      benefits: Array.isArray(t.benefits) ? t.benefits.join(", ") : t.benefits
    };
    setEditing(formValues); 
    setOpen(true); 
  };
  
  const onDelete = (t: any) => {
    // API logic for delete not provided, simulating local remove for now
    setItems((p) => p.filter((x) => x._id !== t._id));
    toast.success(`Removed ${t.name}`);
  };

  const toggle = async (t: any) => {
    try {
      const payload = { isActive: !t.isActive };
      const res = await apiClient.patch(`/affiliate/admin/tiers/${t._id}`, payload);
      if (res.data.success) {
        setItems((p) => p.map((x) => x._id === t._id ? { ...x, isActive: !x.isActive } : x));
        toast.success("Updated status");
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Tiers"
        subtitle="Reward levels based on monthly conversions."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> New tier</Button>}
      />

      {loading ? (
        <Card className="p-12 text-center text-muted-foreground">
          Loading commission tiers...
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((t) => {
            return (
              <Card key={t._id} className="p-5 overflow-hidden relative">
                <div 
                  className={`h-24 -mx-5 -mt-5 mb-4 grid place-items-center text-white relative`}
                  style={{ backgroundColor: t.themeColor || "#64748b" }}
                >
                  <Award className="h-10 w-10" />
                  <div className="absolute top-2 right-2">
                    <Switch checked={t.isActive} onCheckedChange={() => toggle(t)} />
                  </div>
                </div>
                <div className="font-semibold text-lg">{t.name}</div>
                <div className="mt-1 flex items-baseline gap-2">
                   <div className="text-3xl font-bold text-primary">
                     {t.commissionType === "percentage" ? `${t.commissionAmount}%` : `₹${t.commissionAmount}`}
                   </div>
                   {t.commissionType === "percentage" && t.maxCap && (
                     <div className="text-xs text-muted-foreground">(Max ₹{t.maxCap})</div>
                   )}
                </div>
                <div className="text-xs text-muted-foreground mb-3">default commission</div>
                <div className="text-xs text-muted-foreground mb-3">Requires {t.minSales}+ sales / month</div>
                
                {t.categories && t.categories.length > 0 && (
                  <div className="bg-secondary/40 px-2 py-1.5 rounded text-xs mb-3 font-medium flex items-center justify-between">
                     <span>{t.categories.length} Category Rules</span>
                  </div>
                )}
                
                <ul className="space-y-1 text-sm">
                  {(t.benefits || []).map((p: string, i: number) => <li key={i}>✓ {p}</li>)}
                </ul>
                <div className="mt-6 flex justify-end gap-1">
                  <Button variant="outline" size="sm" className="mr-auto gap-1 text-xs" onClick={() => { setCategoryTier(t); setCategoryOpen(true); }}>
                    <ListTree className="h-3.5 w-3.5" /> Categories
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(t)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <FormDialog<any>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit tier" : "New commission tier"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ isActive: true, commissionType: "flat" }}
        onSubmit={async (v) => {
          try {
            const payload = {
              name: v.name,
              minSales: Number(v.minSales),
              commissionType: v.commissionType,
              commissionAmount: Number(v.commissionAmount),
              maxCap: v.maxCap ? Number(v.maxCap) : null,
              benefits: typeof v.benefits === "string" ? v.benefits.split(",").map((s: string) => s.trim()).filter(Boolean) : v.benefits,
              isActive: v.isActive,
              themeColor: editing?.themeColor || colors[items.length % colors.length],
            };

            if (editing) {
              const res = await apiClient.patch(`/affiliate/admin/tiers/${editing._id}`, payload);
              if (res.data.success) {
                // If backend returns populated object, use it. Otherwise rely on local merge
                const updated = res.data.data ? res.data.data : { ...editing, ...payload };
                setItems((p) => p.map((x) => x._id === editing._id ? updated : x));
                toast.success("Tier updated");
              } else {
                toast.error(res.data.message || "Failed to update tier");
              }
            } else {
              const res = await apiClient.post("/affiliate/admin/tiers", payload);
              if (res.data.success) {
                setItems((p) => [...p, res.data.data]);
                toast.success("Tier created");
              } else {
                toast.error(res.data.message || "Failed to create tier");
              }
            }
            setOpen(false);
          } catch (e: any) {
             toast.error(e.message || "An error occurred");
          }
        }}
      />
      
      <CategoryOverridesDialog
         open={categoryOpen}
         onOpenChange={setCategoryOpen}
         tier={categoryTier}
         onSaved={(updatedTier) => {
             // Replace local tier in list
             setItems((p) => p.map(t => t._id === updatedTier._id ? updatedTier : t));
         }}
      />
    </div>
  );
}
