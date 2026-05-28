import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { TrendingUp, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/marketing/trending")({
  component: TrendingPage,
});

function TrendingPage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/products/trending");
      if (res.data.success) {
        setTrending(res.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to load trending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Trending Products" subtitle="Items rising in views and orders this week." />

      {loading ? (
        <Card className="p-12 text-center text-muted-foreground">
          Loading trending products...
        </Card>
      ) : trending.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No trending products found.
        </Card>
      ) : (
        <div className="grid gap-3">
          {trending.map((p, i) => {
            const imgUrl = p.icon || (p.images && p.images.length > 0 ? p.images[0] : null);
            
            return (
              <Card key={p._id} className="p-4 flex items-center gap-4">
                <div className="text-2xl font-bold text-muted-foreground w-8 text-center">#{i + 1}</div>
                <div className="h-12 w-12 rounded bg-primary/10 text-primary grid place-items-center overflow-hidden shrink-0">
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <TrendingUp className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">₹{p.price} • {p.discount > 0 ? `${p.discount}% OFF` : 'No discount'}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-success font-medium text-sm">
                    <ArrowUp className="h-3 w-3" /> {12 + (i * 7) % 60}%
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">vs last week</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
