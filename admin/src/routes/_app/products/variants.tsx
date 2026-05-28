import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { products, inrFormat } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/products/variants")({
  component: VariantsPage,
});

interface VariantRow {
  id: string;
  product: string;
  sku: string;
  option: string;
  price: number;
  stock: number;
  active: boolean;
}

const seed: VariantRow[] = products.flatMap((p) =>
  Array.from({ length: p.variants }).map((_, i) => ({
    id: `${p.id}-V${i + 1}`,
    product: p.name,
    sku: `${p.sku}-V${i + 1}`,
    option: ["Standard", "With Cable", "Bulk Pack", "OEM"][i] ?? "Variant",
    price: p.basePrice + i * 50,
    stock: Math.max(0, p.stock - i * 2),
    active: i % 5 !== 0,
  }))
).slice(0, 30);

const fields: FormField[] = [
  { name: "product", label: "Product", required: true, placeholder: "Arduino Uno R3" },
  { name: "sku", label: "SKU", required: true, span: 6, placeholder: "SKU-2000-V1" },
  { name: "option", label: "Option", span: 6, placeholder: "Standard" },
  { name: "price", label: "Price (₹)", type: "number", span: 6, required: true },
  { name: "stock", label: "Stock", type: "number", span: 6 },
  { name: "active", label: "Active", type: "switch" },
];

function VariantsPage() {
  const [items, setItems] = useState<VariantRow[]>(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VariantRow | null>(null);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (r: VariantRow) => { setEditing(r); setOpen(true); };
  const onDelete = (r: VariantRow) => {
    setItems((p) => p.filter((x) => x.id !== r.id));
    toast.success(`Removed ${r.sku}`);
  };
  const toggle = (id: string) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, active: !x.active } : x));
    toast.success("Status updated");
  };

  const cols: Column<VariantRow>[] = [
    { key: "product", header: "Product", cell: (r) => <span className="font-medium">{r.product}</span> },
    { key: "sku", header: "SKU", cell: (r) => <code className="text-xs">{r.sku}</code> },
    { key: "option", header: "Option", cell: (r) => <Badge variant="secondary">{r.option}</Badge> },
    { key: "price", header: "Price", cell: (r) => inrFormat(r.price) },
    {
      key: "stock", header: "Stock", cell: (r) => (
        <span className={r.stock === 0 ? "text-destructive" : r.stock < 5 ? "text-warning" : ""}>{r.stock}</span>
      )
    },
    { key: "active", header: "Active", cell: (r) => <Switch checked={r.active} onCheckedChange={() => toggle(r.id)} /> },
    {
      key: "actions", header: "", className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Variants"
        subtitle="All SKU-level variants across the catalog."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Add variant</Button>}
      />
      <DataTable storageKey="products.variants" data={items} columns={cols} searchKeys={["product", "sku", "option"]} />

      <FormDialog<VariantRow>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit variant" : "New variant"}
        description="SKU-level variant configuration."
        fields={fields}
        initialValues={editing}
        defaultValues={{ active: true }}
        onSubmit={(v) => {
          if (editing) {
            setItems((p) => p.map((x) => x.id === editing.id ? { ...editing, ...v } : x));
            toast.success("Variant updated");
          } else {
            setItems((p) => [{ ...v, id: `V-${Date.now()}` }, ...p]);
            toast.success("Variant created");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
