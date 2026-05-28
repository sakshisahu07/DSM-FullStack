import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { StatsCard } from "@/components/stats-card";
import { Plus, Download, FileText, IndianRupee, Clock, AlertCircle, Loader2, Search } from "lucide-react";
import { inrFormat } from "@/lib/mock-data";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = import.meta.env.VITE_API_URL || "http://15.207.149.229:2000/api/v1";

export const Route = createFileRoute("/_app/orders/invoices")({
  component: InvoicesPage,
});

interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: {
    _id: string;
    status: string;
  };
  customerId: any;
  invoiceType: string;
  paymentStatus: string;
  pdfUrl: string;
  totals: {
    subtotal: number;
    discount: number;
    couponDiscount: number;
    shippingCharge: number;
    grandTotal: number;
  };
  issuedAt: string;
  createdAt: string;
}

function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [genOpen, setGenOpen] = useState(false);
  const [orderIdToGen, setOrderIdToGen] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/invoice/all`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
      }
    } catch (err) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const totalBilled = items.reduce((s, i) => s + (i.totals?.grandTotal || 0), 0);
  const paidCount = items.filter(i => i.paymentStatus === "PAID").length;
  const pendingCount = items.filter(i => i.paymentStatus === "UNPAID").length;

  const handleGenerate = async () => {
    if (!orderIdToGen.trim()) return;
    try {
      setGenerating(true);
      const res = await apiFetch(`${API_BASE}/invoice/generate/${orderIdToGen.trim()}`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Invoice generated successfully");
        setGenOpen(false);
        fetchInvoices();
      } else {
        toast.error(json.message || "Generation failed");
      }
    } catch (err) {
      toast.error("Error generating invoice");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (url: string, number: string) => {
    if (!url) {
      toast.error("PDF URL not available");
      return;
    }
    window.open(url, "_blank");
  };

  const cols: Column<Invoice>[] = [
    { 
      key: "invoiceNumber", 
      header: "Invoice #", 
      sortable: true, 
      cell: (r) => <span className="font-mono text-xs font-bold text-primary">{r.invoiceNumber}</span> 
    },
    { 
      key: "orderId", 
      header: "Order Details", 
      cell: (r) => (
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">{r.orderId?._id || "N/A"}</div>
          <div className="text-xs font-semibold uppercase tracking-wider">{r.orderId?.status || "UNKNOWN"}</div>
        </div>
      ) 
    },
    { 
      key: "grandTotal", 
      header: "Grand Total", 
      sortable: true, 
      sortAccessor: (r) => r.totals?.grandTotal,
      cell: (r) => <span className="font-bold">{inrFormat(r.totals?.grandTotal || 0)}</span> 
    },
    { 
      key: "paymentStatus", 
      header: "Payment", 
      cell: (r) => (
        <StatusBadge variant={r.paymentStatus === "PAID" ? "success" : "warning"}>
          {r.paymentStatus}
        </StatusBadge>
      ) 
    },
    { 
      key: "issuedAt", 
      header: "Date", 
      sortable: true, 
      cell: (r) => <span className="text-xs text-muted-foreground">{format(new Date(r.issuedAt), "dd MMM yyyy")}</span> 
    },
    {
      key: "actions", 
      header: "", 
      className: "text-right",
      cell: (r) => (
        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleDownload(r.pdfUrl, r.invoiceNumber)} title="Download PDF">
          <Download className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Manage billing and tax invoices."
        actions={
          <Button className="gap-1.5" size="sm" onClick={() => setGenOpen(true)}>
            <Plus className="h-4 w-4" /> Generate Invoice
          </Button>
        }
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Billed" value={inrFormat(totalBilled)} icon={IndianRupee} tone="primary" />
        <StatsCard label="Paid" value={String(paidCount)} icon={Clock} tone="success" />
        <StatsCard label="Unpaid" value={String(pendingCount)} icon={AlertCircle} tone="warning" />
        <StatsCard label="Total Count" value={String(items.length)} icon={FileText} tone="default" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        </div>
      ) : (
        <DataTable<Invoice>
          data={items}
          columns={cols}
          searchKeys={["invoiceNumber", "_id"]}
          storageKey="invoices.table"
          emptyMessage="No invoices found."
        />
      )}

      {/* Generate Dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>Enter the Order ID to generate a new invoice.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order-id">Order ID</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="order-id"
                  placeholder="Paste order ID here..."
                  className="pl-9"
                  value={orderIdToGen}
                  onChange={(e) => setOrderIdToGen(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
            <Button disabled={!orderIdToGen.trim() || generating} onClick={handleGenerate}>
              {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
