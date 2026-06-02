import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { Card } from "@/components/ui/card";
import { Users, MousePointerClick, ShoppingCart, IndianRupee } from "lucide-react";
import { inrFormat } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/affiliate/dashboard")({
  component: AffiliateDashboard,
});

function AffiliateDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/affiliate/admin/dashboard-overview");
        if (response.data.success) {
          setOverview(response.data.data.overview);
          setTopPerformers(response.data.data.topPerformers.data || []);
        } else {
          setError(response.data.message || "Failed to fetch data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Affiliate Dashboard" subtitle="Performance across the affiliate program." />
        <div className="p-4 text-muted-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Affiliate Dashboard" subtitle="Performance across the affiliate program." />
        <div className="p-4 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliate Dashboard" subtitle="Performance across the affiliate program." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Active affiliates" value={overview?.activeAffiliates?.count || 0} icon={Users} change={overview?.activeAffiliates?.percentChange || 0} tone="primary" />
        <StatsCard label="Total clicks" value={(overview?.totalClicks?.count || 0).toLocaleString("en-IN")} icon={MousePointerClick} change={overview?.totalClicks?.percentChange || 0} tone="success" />
        <StatsCard label="Conversions" value={overview?.conversions?.count || 0} icon={ShoppingCart} change={overview?.conversions?.percentChange || 0} />
        <StatsCard label="Pending payout" value={inrFormat(overview?.pendingPayout?.amount || 0)} icon={IndianRupee} tone="warning" />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Top performers</h3>
        {topPerformers.length === 0 ? (
          <div className="text-sm text-muted-foreground">No top performers found.</div>
        ) : (
          <div className="space-y-2">
            {topPerformers.map((a, i) => (
              <div key={a.id || i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                <div className="w-6 text-center text-sm font-bold text-muted-foreground">#{i + 1}</div>
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold">
                  {a.name ? a.name.split(" ").map((s: string) => s[0]).join("").slice(0, 2) : "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.name || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{a.referralCode || "N/A"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{a.conversions || 0} sales</div>
                  <div className="text-xs text-muted-foreground">{inrFormat(a.earningsPaid || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
