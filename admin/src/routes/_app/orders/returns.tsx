import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { inrFormat } from "@/lib/mock-data";
import { apiFetch } from "@/lib/api";
import { useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://15.207.149.229:2000/api/v1";

export const Route = createFileRoute("/_app/orders/returns")({
  component: ReturnsPage,
});

interface ReturnRow {
  id: string; order: string; customer: string; reason: string; amount: number;
  status: "requested" | "approved" | "refunded" | "rejected";
  date: string; resolved: boolean;
  adminReason?: string;
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("dsm_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

const tone = {
  requested: "bg-warning/15 text-warning",
  approved: "bg-info/15 text-info",
  refunded: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

const fields: FormField[] = [
  { name: "order", label: "Order ID", required: true, span: 6, placeholder: "ORD-10240" },
  { name: "customer", label: "Customer", required: true, span: 6 },
  { name: "amount", label: "Refund (₹)", type: "number", span: 6, required: true },
  { name: "date", label: "Date", span: 6, placeholder: "Apr 28" },
  { name: "reason", label: "Reason", type: "textarea", required: true },
  {
    name: "status", label: "Status", type: "select", required: true,
    options: [
      { label: "Requested", value: "requested" },
      { label: "Approved", value: "approved" },
      { label: "Refunded", value: "refunded" },
      { label: "Rejected", value: "rejected" },
    ],
  },
  { name: "adminReason", label: "Admin Reason", type: "textarea", placeholder: "Optional note for status update" },
  { name: "resolved", label: "Resolved", type: "switch" },
];

function ReturnsPage() {
  const [items, setItems] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ReturnRow | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/order?limit=200`);
      const json = await res.json();
      if (json.success) {
        // Filter orders that have return information
        const returnsData = (json.data.orders || [])
          .filter((o: any) => o.returnStatus)
          .map((o: any) => ({
            id: o._id,
            order: o._id,
            customer: o.customerId ? `${o.customerId.firstName || ""} ${o.customerId.lastName || ""}`.trim() || "Guest" : "Guest",
            reason: o.returnReason || "No reason provided",
            amount: o.orderTotal || 0,
            status: o.returnStatus.toLowerCase(),
            date: new Date(o.createdAt).toLocaleDateString(),
            resolved: ["refunded", "rejected"].includes(o.returnStatus?.toLowerCase()),
            adminReason: o.adminReason || "",
          }));
        setItems(returnsData);
      }
    } catch (error) {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (r: ReturnRow) => { setEditing(r); setOpen(true); };
  const onDelete = (r: ReturnRow) => {
    setItems((p) => p.filter((x) => x.id !== r.id));
    toast.success(`Deleted ${r.id}`);
  };
  const toggle = (id: string) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, resolved: !x.resolved } : x));
    toast.success("Updated");
  };

  const cols: Column<ReturnRow>[] = [
    { key: "id", header: "Return ID", cell: (r) => <code className="text-xs">{r.id}</code> },
    { key: "order", header: "Order", cell: (r) => <span className="font-medium">{r.order}</span> },
    { key: "customer", header: "Customer", cell: (r) => r.customer },
    { key: "reason", header: "Reason", cell: (r) => <span className="text-sm text-muted-foreground">{r.reason}</span> },
    { key: "amount", header: "Refund", cell: (r) => inrFormat(r.amount) },
    { key: "date", header: "Date", cell: (r) => r.date },
    { key: "status", header: "Status", cell: (r) => <Badge variant="outline" className={tone[r.status]}>{r.status}</Badge> },
    { key: "resolved", header: "Resolved", cell: (r) => <Switch checked={r.resolved} onCheckedChange={() => toggle(r.id)} /> },
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
        title="Returns & Refunds"
        subtitle="Customer return requests and refund tracking."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> New return</Button>}
      />
      {loading ? (
         <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching returns...</p>
         </div>
       ) : (
         <DataTable storageKey="orders.returns" data={items} columns={cols} searchKeys={["order", "customer"]} />
       )}

      <FormDialog<ReturnRow>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit return" : "Log return request"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ status: "requested", resolved: false }}
        onSubmit={async (v) => {
          if (editing) {
            // Call the API to update the return status
            try {
              const res = await fetch(`http://15.207.149.229:2000/api/v1/order/${editing.id}/return-status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  ...getAuthHeader(),
                },
                body: JSON.stringify({
                  status: v.status,
                  adminReason: v.adminReason || "",
                }),
              });
              
              if (!res.ok) {
                const text = await res.text();
                console.error("API error:", text);
                toast.error("Failed to update status on server");
              } else {
                const json = await res.json();
                if (json.success === false) {
                  toast.error(json.message || "Failed to update status");
                } else {
                  toast.success("Return status updated successfully");
                  fetchReturns();
                  setOpen(false);
                }
              }
            } catch (error) {
              console.error(error);
              toast.error("Network error while updating status");
            }
          } else {
            setItems((p) => [{ ...v, id: `RET-${String(Date.now()).slice(-3)}` }, ...p]);
            toast.success("Return created locally (not in backend)");
            setOpen(false);
          }
        }}
      />
    </div>
  );
}
