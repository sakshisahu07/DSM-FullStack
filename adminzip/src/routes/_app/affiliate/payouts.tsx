import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { inrFormat } from "@/lib/mock-data";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/affiliate/payouts")({
  component: PayoutsPage,
});

interface PayoutRow { 
  id: string; 
  _id?: string;
  affiliate: string; 
  method: string; 
  amount: number; 
  date: string; 
  status: "pending" | "paid" | "failed"; 
  processed: boolean; 
}

const tone: Record<string, string> = { pending: "bg-warning/15 text-warning", paid: "bg-success/15 text-success", failed: "bg-destructive/15 text-destructive" };

const fields: FormField[] = [
  { name: "affiliate", label: "Affiliate", required: true },
  {
    name: "method", label: "Method", type: "select", required: true, span: 6,
    options: [
      { label: "UPI", value: "UPI" },
      { label: "Bank Transfer", value: "Bank Transfer" },
      { label: "Wallet", value: "Wallet" },
    ],
  },
  { name: "amount", label: "Amount (₹)", type: "number", span: 6, required: true },
  { name: "date", label: "Date", span: 6 },
  {
    name: "status", label: "Status", type: "select", required: true, span: 6,
    options: [
      { label: "Pending", value: "pending" },
      { label: "Paid", value: "paid" },
      { label: "Failed", value: "failed" },
    ],
  },
  { name: "processed", label: "Processed", type: "switch" },
];

function PayoutsPage() {
  const [items, setItems] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PayoutRow | null>(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/affiliate/admin/withdrawals");
      if (res.data.success) {
        // Handle both paginated (data.data) and non-paginated (data) responses
        const dataArr = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []);
        
        const mapped: PayoutRow[] = dataArr.map((r: any) => {
          let affiliateName = "Unknown";
          if (r.affiliateName) affiliateName = r.affiliateName;
          else if (r.userId && r.userId.firstName) affiliateName = `${r.userId.firstName} ${r.userId.lastName || ""}`.trim();
          else if (r.affiliate && r.affiliate.firstName) affiliateName = `${r.affiliate.firstName} ${r.affiliate.lastName || ""}`.trim();
          else if (typeof r.affiliate === "string") affiliateName = r.affiliate;

          return {
            id: r._id || r.id || `PAY-${Math.random().toString(36).substring(7)}`,
            _id: r._id,
            affiliate: affiliateName,
            method: r.method || r.withdrawalMethod || r.paymentMethod || "N/A",
            amount: r.amount || 0,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
            status: (r.status?.toLowerCase() || "pending") as "pending" | "paid" | "failed",
            processed: r.processed ?? r.isProcessed ?? (r.status === "paid" || r.status === "approved"),
          };
        });
        setItems(mapped);
      }
    } catch (e) {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (r: PayoutRow) => { setEditing(r); setOpen(true); };
  const onDelete = (r: PayoutRow) => {
    // Local simulation for delete
    setItems((p) => p.filter((x) => x.id !== r.id));
    toast.success(`Removed ${r.id}`);
  };
  const toggle = (id: string) => {
    // Local simulation for toggle
    setItems((p) => p.map((x) => x.id === id ? { ...x, processed: !x.processed } : x));
    toast.success("Updated");
  };

  const cols: Column<PayoutRow>[] = [
    { key: "id", header: "ID", cell: (r) => <code className="text-xs">{r.id.length > 10 ? r.id.slice(-6).toUpperCase() : r.id}</code> },
    { key: "affiliate", header: "Affiliate", cell: (r) => <span className="font-medium">{r.affiliate}</span> },
    { key: "method", header: "Method", cell: (r) => <Badge variant="secondary">{r.method}</Badge> },
    { key: "amount", header: "Amount", cell: (r) => <span className="font-medium">{inrFormat(r.amount)}</span> },
    { key: "date", header: "Date", cell: (r) => r.date },
    { key: "status", header: "Status", cell: (r) => <Badge variant="outline" className={tone[r.status] || "bg-muted"}>{r.status}</Badge> },
    { key: "processed", header: "Processed", cell: (r) => <Switch checked={r.processed} onCheckedChange={() => toggle(r.id)} /> },
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
        title="Payouts"
        subtitle="Affiliate payout queue and history."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> New payout</Button>}
      />
      {loading ? (
        <div className="p-12 text-center text-muted-foreground border rounded-lg">Loading payouts...</div>
      ) : (
        <DataTable storageKey="affiliate.payouts" data={items} columns={cols} searchKeys={["affiliate", "id"]} />
      )}

      <FormDialog<PayoutRow>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit payout" : "Create payout"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ method: "UPI", status: "pending", processed: false, date: new Date().toLocaleDateString("en-IN") }}
        onSubmit={(v) => {
          if (editing) {
            setItems((p) => p.map((x) => x.id === editing.id ? { ...editing, ...v } : x));
            toast.success("Payout updated");
          } else {
            setItems((p) => [{ ...v, id: `PAY-${1000 + p.length + 1}` }, ...p]);
            toast.success("Payout created");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
