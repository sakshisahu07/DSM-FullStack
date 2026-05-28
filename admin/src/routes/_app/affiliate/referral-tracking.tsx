import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/_app/affiliate/referral-tracking")({
  component: ReferralTrackingPage,
});

interface ChartData {
  label: string;
  date: string;
  clicks: number;
  conversions: number;
}

interface TopReferralCode {
  referralCode: string;
  name?: string;
  clicks: number;
  conversions: number;
  id?: string;
}

interface ReferralTrackingResponse {
  period: {
    days: number;
    from: string;
    to: string;
  };
  chartData: ChartData[];
  topReferralCodes: {
    data: TopReferralCode[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function ReferralTrackingPage() {
  const [data, setData] = useState<ReferralTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/affiliate/admin/referral-tracking");
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch referral tracking data");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Referral Tracking" subtitle="Click and conversion trends per affiliate." />
        <Card className="p-5">
          <Skeleton className="h-[300px] w-full" />
        </Card>
        <Card className="p-5">
          <div className="space-y-4">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Referral Tracking" subtitle="Click and conversion trends per affiliate." />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const chartData = data?.chartData || [];
  const topReferralCodes = data?.topReferralCodes?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Referral Tracking" subtitle="Click and conversion trends per affiliate." />

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Last {data?.period.days} days</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip 
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                labelClassName="font-medium mb-1 block"
              />
              <Area 
                name="Clicks"
                type="monotone" 
                dataKey="clicks" 
                stroke="var(--primary)" 
                fill="url(#g1)" 
                strokeWidth={2}
              />
              <Area 
                name="Conversions"
                type="monotone" 
                dataKey="conversions" 
                stroke="var(--info)" 
                fill="var(--info)" 
                fillOpacity={0.15} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Top referral codes</h3>
        {topReferralCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            No referral data available for this period.
          </div>
        ) : (
          <div className="grid gap-2">
            {topReferralCodes.map((a, idx) => (
              <div key={a.id || a.referralCode || idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">{a.referralCode}</Badge>
                  <span className="text-sm">{a.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div><span className="text-muted-foreground">Clicks:</span> <strong>{a.clicks}</strong></div>
                  <div><span className="text-muted-foreground">Conv:</span> <strong>{a.conversions}</strong></div>
                  <div><span className="text-muted-foreground">CR:</span> <strong>{a.clicks > 0 ? ((a.conversions / a.clicks) * 100).toFixed(1) : "0.0"}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
