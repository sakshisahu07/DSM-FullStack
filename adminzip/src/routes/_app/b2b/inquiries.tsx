import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Eye, Package } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/b2b/inquiries")({
  component: InquiriesPage,
});

const API_BASE = `${API_BASE_URL}/bulk-inquiry`;

/* ── Types ── */
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface InquiryRaw {
  _id: string;
  userId: string | null;
  products: Product[];
  country: string;
  state: string;
  city: string;
  pincode: string;
  message: string;
  status: "pending" | "contacted" | "closed";
  createdAt: string;
  updatedAt: string;
}

interface Inquiry {
  id: string;
  _id: string;
  products: Product[];
  location: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  message: string;
  status: "pending" | "contacted" | "closed";
  createdAt: string;
  updatedAt: string;
  productNames: string;
}

/* ── Helpers ── */
const statusStyles: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  contacted: "bg-info/15 text-info",
  closed: "bg-success/15 text-success",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapInquiry(raw: InquiryRaw): Inquiry {
  const products = Array.isArray(raw.products) ? raw.products : [];
  return {
    id: raw._id,
    _id: raw._id,
    products: products,
    location: `${raw.city || ""}, ${raw.state || ""}, ${raw.country || ""} - ${raw.pincode || ""}`.replace(/^, /, ""),
    country: raw.country || "",
    state: raw.state || "",
    city: raw.city || "",
    pincode: raw.pincode || "",
    message: raw.message || "",
    status: raw.status || "pending",
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    productNames: products.map((p) => p?.name || "Unknown").join(", "),
  };
}

/* ── Component ── */
function InquiriesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<Inquiry | null>(null);

  /* ── Fetch inquiries ── */
  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(API_BASE);
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("dsm_token");
        navigate({ to: "/login" });
        throw new Error("Session expired. Please login again.");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "API returned success=false");
      
      const rawData = Array.isArray(json.data) ? json.data : [];
      setItems(rawData.map(mapInquiry));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
      toast.error(`Failed to load inquiries: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  /* ── Update status ── */
  const updateStatus = async (
    id: string,
    newStatus: "pending" | "contacted" | "closed"
  ) => {
    setUpdatingId(id);
    try {
      const res = await apiFetch(`${API_BASE}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("dsm_token");
        navigate({ to: "/login" });
        throw new Error("Session expired. Please login again.");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Update failed");

      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(`Failed to update status: ${msg}`);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Columns ── */
  const cols: Column<Inquiry>[] = [
    {
      key: "products",
      header: "Products",
      cell: (r) => (
        <div className="flex items-center gap-2 min-w-[180px]">
          <div className="flex -space-x-2">
            {r.products.slice(0, 3).map((p) => (
              <img
                key={p._id}
                src={p.icon}
                alt={p.name}
                className="h-8 w-8 rounded-md border-2 border-background object-cover"
              />
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-[160px]">
              {r.products.map((p) => p.name).join(", ")}
            </span>
            <span className="text-xs text-muted-foreground">
              {r.products.length} product{r.products.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      cell: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {r.city}, {r.state}
          </span>
          <span className="text-xs text-muted-foreground">
            {r.country} — {r.pincode}
          </span>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      cell: (r) => (
        <span
          className="text-sm truncate max-w-[200px] block"
          title={r.message}
        >
          {r.message}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (r) => (
        <Select
          value={r.status}
          onValueChange={(val) =>
            updateStatus(r._id, val as "pending" | "contacted" | "closed")
          }
          disabled={updatingId === r._id}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue>
              <Badge variant="outline" className={statusStyles[r.status]}>
                {updatingId === r._id ? "Updating…" : r.status}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <Badge variant="outline" className={statusStyles.pending}>
                pending
              </Badge>
            </SelectItem>
            <SelectItem value="contacted">
              <Badge variant="outline" className={statusStyles.contacted}>
                contacted
              </Badge>
            </SelectItem>
            <SelectItem value="closed">
              <Badge variant="outline" className={statusStyles.closed}>
                closed
              </Badge>
            </SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      sortAccessor: (r) => new Date(r.createdAt).getTime(),
      cell: (r) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setDetailItem(r)}
          title="View details"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Inquiries"
        subtitle="Inquiry requests from customers."
        actions={
          <Button
            className="gap-1.5"
            variant="outline"
            onClick={fetchInquiries}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      {error && !loading && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}{" "}
          <Button
            variant="link"
            className="text-destructive underline p-0 h-auto"
            onClick={fetchInquiries}
          >
            Retry
          </Button>
        </div>
      )}

      <DataTable
        storageKey="b2b.inquiries"
        data={items}
        columns={cols}
        searchKeys={["productNames", "city", "state", "message", "pincode"]}
        loading={loading}
        emptyMessage="No bulk inquiries found."
      />

      {/* ── Detail dialog ── */}
      <Dialog
        open={!!detailItem}
        onOpenChange={(open) => !open && setDetailItem(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>

          {detailItem && (
            <div className="space-y-4">
              {/* Products */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Package className="h-4 w-4" /> Products
                </h4>
                <div className="space-y-2">
                  {detailItem.products.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center gap-3 rounded-lg border p-2"
                    >
                      <img
                        src={p.icon}
                        alt={p.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Country</span>
                  <p className="font-medium">{detailItem.country}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">State</span>
                  <p className="font-medium">{detailItem.state}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">City</span>
                  <p className="font-medium">{detailItem.city}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pincode</span>
                  <p className="font-medium">{detailItem.pincode}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <span className="text-sm text-muted-foreground">Message</span>
                <p className="text-sm font-medium mt-0.5 p-2 rounded-md bg-muted/50">
                  {detailItem.message}
                </p>
              </div>

              {/* Status + dates */}
              <div className="flex items-center justify-between text-sm border-t pt-3">
                <Badge
                  variant="outline"
                  className={statusStyles[detailItem.status]}
                >
                  {detailItem.status}
                </Badge>
                <span className="text-muted-foreground">
                  Created {formatDateTime(detailItem.createdAt)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
