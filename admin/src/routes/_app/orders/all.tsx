import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Eye, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, type Column } from "@/components/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { DashboardFilters } from "@/components/dashboard-filters";
import { inrFormat } from "@/lib/mock-data";
import { apiFetch } from "@/lib/api";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

export const Route = createFileRoute("/_app/orders/all")({
  component: OrdersAll,
});

interface Order {
  _id: string;
  customerId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    number?: string;
  } | null;
  customerSnapshot?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  orderTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingMode: string;
  createdAt: string;
}

// Helpers to get customer info with snapshot fallback
function getCustomerName(o: Order): string {
  if (o.customerId) {
    const name = `${o.customerId.firstName || ""} ${o.customerId.lastName || ""}`.trim();
    if (name) return name;
  }
  if (o.customerSnapshot) {
    const name = `${o.customerSnapshot.firstName || ""} ${o.customerSnapshot.lastName || ""}`.trim();
    if (name) return name;
  }
  return "Unknown Customer";
}

function getCustomerEmail(o: Order): string {
  if (o.customerId?.email) return o.customerId.email;
  if (o.customerSnapshot?.email) return o.customerSnapshot.email;
  return "No Email";
}

function statusVariant(s: string) {
  const status = s.toLowerCase();
  if (status === "delivered") return "success" as const;
  if (["shipping", "processing", "confirmed"].includes(status)) return "info" as const;
  if (["ordered", "placed"].includes(status)) return "warning" as const;
  if (status === "cancelled") return "danger" as const;
  return "default" as const;
}

function OrdersAll() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<Order | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/order?limit=50`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data.orders || []);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const verifyPayment = async (orderId: string) => {
    try {
      setVerifying(true);
      const res = await apiFetch(`${API_BASE}/order/verify-payment`, {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Payment verified successfully");
        fetchOrders();
        setView(null);
      } else {
        toast.error(json.message || "Verification failed");
      }
    } catch (err) {
      toast.error("Error verifying payment");
    } finally {
      setVerifying(false);
    }
  };

  const columns: Column<Order>[] = [
    { key: "_id", header: "Order ID", cell: (o) => <span className="font-mono text-[10px] uppercase">{o._id}</span> },
    { 
      key: "customerId", 
      header: "Customer", 
      cell: (o) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {getCustomerName(o)}
          </span>
          <span className="text-[10px] text-muted-foreground">{getCustomerEmail(o)}</span>
        </div>
      ) 
    },
    { key: "createdAt", header: "Date", cell: (o) => <span className="text-xs text-muted-foreground">{format(new Date(o.createdAt), "dd MMM, HH:mm")}</span> },
    { key: "orderTotal", header: "Amount", cell: (o) => <span className="font-bold">{inrFormat(o.orderTotal)}</span> },
    { key: "paymentMethod", header: "Method", cell: (o) => <StatusBadge variant="info">{o.paymentMethod}</StatusBadge> },
    {
      key: "paymentStatus", header: "Payment Status",
      cell: (o) => <StatusBadge variant={o.paymentStatus === "PAID" ? "success" : o.paymentStatus === "UNPAID" ? "warning" : "danger"}>{o.paymentStatus}</StatusBadge>,
    },
    { key: "status", header: "Status", cell: (o) => <StatusBadge variant={statusVariant(o.status)}>{o.status}</StatusBadge> },
    {
      key: "actions", header: "", className: "text-right",
      cell: (o) => (
        <Button size="sm" variant="ghost" className="h-8" onClick={() => setView(o)}>
          <Eye className="h-3.5 w-3.5 mr-1" /> View
        </Button>
      ),
    },
  ];

  return (
     <div className="space-y-6">
       <PageHeader 
         title="All Orders" 
         subtitle={`${items.length} orders across all statuses`} 
       />
       <DashboardFilters />
       
       {loading ? (
         <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching orders...</p>
         </div>
       ) : (
         <DataTable storageKey="orders.all" data={items} columns={columns} searchKeys={["_id"]} />
       )}

      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details
              <span className="text-xs font-mono text-muted-foreground uppercase">{view?._id}</span>
            </DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Customer</div>
                  <div className="font-semibold text-base">{view ? getCustomerName(view) : "Unknown Customer"}</div>
                  <div className="text-xs text-muted-foreground">{view ? getCustomerEmail(view) : "No Email"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Order Date</div>
                  <div className="font-semibold text-base">{format(new Date(view.createdAt), "dd MMM yyyy, HH:mm")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Total Amount</div>
                  <div className="font-bold text-xl text-primary">{inrFormat(view.orderTotal)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Shipping Mode</div>
                  <div className="font-semibold uppercase">{view.shippingMode || "N/A"}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <div className="text-[10px] uppercase text-muted-foreground font-bold">Payment Info</div>
                    <div className="flex items-center gap-2">
                       <StatusBadge variant="info">{view.paymentMethod}</StatusBadge>
                       <StatusBadge variant={view.paymentStatus === "PAID" ? "success" : "warning"}>{view.paymentStatus}</StatusBadge>
                    </div>
                 </div>
                 <div className="space-y-2 text-right">
                    <div className="text-[10px] uppercase text-muted-foreground font-bold">Current Status</div>
                    <div><StatusBadge variant={statusVariant(view.status)}>{view.status}</StatusBadge></div>
                 </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
                 <div className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Order Progress
                 </div>
                 <Timeline status={view.status} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
             <Button variant="outline" onClick={() => setView(null)}>Close</Button>
             {view?.paymentStatus === "UNPAID" && view.paymentMethod !== "COD" && (
                <Button className="bg-success hover:bg-success/90" onClick={() => verifyPayment(view._id)} disabled={verifying}>
                   {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                   Verify Payment
                </Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Timeline({ status }: { status: string }) {
  const s = status.toLowerCase();
  const steps = ["ordered", "confirmed", "processing", "shipping", "delivered"];
  const idx = steps.indexOf(s);
  
  return (
    <div className="flex items-center gap-1 w-full pt-2">
      {steps.map((step, i) => (
        <div key={step} className="flex-1 flex items-center gap-1">
          <div className="flex flex-col items-center gap-1 min-w-[50px]">
            <div className={`h-6 w-6 rounded-full grid place-items-center text-[8px] font-bold ${
              i <= idx ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <span className={`text-[9px] uppercase tracking-tighter ${i <= idx ? "font-bold text-primary" : "text-muted-foreground"}`}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-[2px] rounded-full ${i < idx ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full bg-border ${className}`} />;
}

function Clock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
