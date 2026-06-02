import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Award, Plus, Pencil, Trash2 } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/affiliate/commission-tiers")({
  component: TiersPage,
});

const fields: FormField[] = [
  { name: "name", label: "Tier name", required: true, span: 6 },
  { name: "commissionAmount", label: "Commission %", type: "number", required: true, span: 6 },
  { name: "minSales", label: "Min sales / month", type: "number", required: true, span: 6 },
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

function TiersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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
              <Card key={t._id} className="p-5 overflow-hidden">
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
                <div className="mt-1 text-3xl font-bold text-primary">{t.commissionAmount}%</div>
                <div className="text-xs text-muted-foreground mb-3">commission per sale</div>
                <div className="text-xs text-muted-foreground mb-3">Requires {t.minSales}+ sales / month</div>
                <ul className="space-y-1 text-sm">
                  {(t.benefits || []).map((p: string, i: number) => <li key={i}>✓ {p}</li>)}
                </ul>
                <div className="mt-4 flex justify-end gap-1">
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
        defaultValues={{ isActive: true }}
        onSubmit={async (v) => {
          try {
            const payload = {
              name: v.name,
              minSales: Number(v.minSales),
              commissionAmount: Number(v.commissionAmount),
              benefits: typeof v.benefits === "string" ? v.benefits.split(",").map((s: string) => s.trim()).filter(Boolean) : v.benefits,
              isActive: v.isActive,
              themeColor: editing?.themeColor || colors[items.length % colors.length],
            };

            if (editing) {
              const res = await apiClient.patch(`/affiliate/admin/tiers/${editing._id}`, payload);
              if (res.data.success) {
                setItems((p) => p.map((x) => x._id === editing._id ? { ...x, ...payload } : x));
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
    </div>
  );
}
