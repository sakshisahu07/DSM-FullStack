import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Truck, Zap, Plane, Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";

export const Route = createFileRoute("/_app/orders/shipping-methods")({
  component: ShippingMethodsPage,
});

interface ShippingMethod {
  id: string; name: string; eta: string; price: number; enabled: boolean; iconKey: "truck" | "zap" | "plane";
}

const iconMap: Record<ShippingMethod["iconKey"], LucideIcon> = { truck: Truck, zap: Zap, plane: Plane };

const seed: ShippingMethod[] = [
  { id: "s1", name: "Standard Delivery", iconKey: "truck", eta: "5-7 business days", price: 49, enabled: true },
  { id: "s2", name: "Express Delivery", iconKey: "zap", eta: "1-2 business days", price: 149, enabled: true },
  { id: "s3", name: "Same Day (metros)", iconKey: "plane", eta: "Within 12 hours", price: 299, enabled: false },
];

const fields: FormField[] = [
  { name: "name", label: "Name", required: true },
  { name: "eta", label: "ETA", required: true, span: 6, placeholder: "5-7 business days" },
  { name: "price", label: "Price (₹)", type: "number", required: true, span: 6 },
  {
    name: "iconKey", label: "Icon", type: "select", span: 6,
    options: [
      { label: "Truck", value: "truck" },
      { label: "Lightning", value: "zap" },
      { label: "Plane", value: "plane" },
    ],
  },
  { name: "enabled", label: "Enabled", type: "switch" },
];

function ShippingMethodsPage() {
  const [items, setItems] = useState<ShippingMethod[]>(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (m: ShippingMethod) => { setEditing(m); setOpen(true); };
  const onDelete = (m: ShippingMethod) => {
    setItems((p) => p.filter((x) => x.id !== m.id));
    toast.success(`Removed ${m.name}`);
  };
  const toggle = (id: string) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x));
    toast.success("Updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping Methods"
        subtitle="Configure carriers, ETAs and rates."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Add method</Button>}
      />

      <div className="grid gap-3">
        {items.map((m) => {
          const Icon = iconMap[m.iconKey];
          return (
            <Card key={m.id} className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.eta}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{m.price}</div>
                <div className="text-[11px] text-muted-foreground">flat rate</div>
              </div>
              <Switch checked={m.enabled} onCheckedChange={() => toggle(m.id)} />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(m)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </Card>
          );
        })}
      </div>

      <FormDialog<ShippingMethod>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit shipping method" : "New shipping method"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ enabled: true, iconKey: "truck" }}
        onSubmit={(v) => {
          if (editing) {
            setItems((p) => p.map((x) => x.id === editing.id ? { ...editing, ...v } : x));
            toast.success("Method updated");
          } else {
            setItems((p) => [...p, { ...v, id: `s-${Date.now()}` }]);
            toast.success("Method created");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
