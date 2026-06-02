import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, type Column } from "@/components/data-table";
import { inrFormat } from "@/lib/mock-data";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/affiliate/all")({
  component: AffiliatesAll,
});

function AffiliatesAll() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/affiliate/admin/list");
      if (res.data.success) {
        setItems(res.data.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const columns: Column<any>[] = [
    { key: "name", header: "Name", cell: (a) => (
      <div>
        <div className="font-medium text-sm">{a.firstName} {a.lastName}</div>
        <div className="text-xs text-muted-foreground">{a.phone}</div>
      </div>
    ) },
    { key: "code", header: "Referral", cell: (a) => <span className="font-mono text-xs">{a.affiliateCode || "-"}</span> },
    { key: "clicks", header: "Clicks", cell: (a) => a.clicks || 0 },
    { key: "conv", header: "Conversions", cell: (a) => a.conversions || 0 },
    { key: "earn", header: "Earnings", cell: (a) => (
      <div>
        <div className="text-sm font-medium">{inrFormat(a.totalEarned || 0)} <span className="text-xs text-muted-foreground">earned</span></div>
        <div className="text-xs text-warning">{inrFormat(a.walletBalance || 0)} wallet</div>
      </div>
    ) },
    { key: "status", header: "Status", cell: (a) => (
      <StatusBadge variant={a.status === "approved" ? "success" : a.status === "pending" ? "warning" : "danger"}>{a.status}</StatusBadge>
    ) },
    { key: "join", header: "Joined", cell: (a) => <span className="text-xs text-muted-foreground">{a.createdAt ? format(new Date(a.createdAt), "dd MMM yyyy") : "-"}</span> },
    {
      key: "actions", header: "", className: "text-right",
      cell: (a) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Affiliates"
        subtitle={`${items.length} affiliates registered`}
      />
      <DataTable storageKey="affiliate.all" data={items} columns={columns} searchKeys={["firstName", "lastName", "phone", "affiliateCode"]} />
    </div>
  );
}
