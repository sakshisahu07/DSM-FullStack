import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Trophy, Star, Award } from "lucide-react";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import { EmptyState } from "@/components/empty-state";
import { inrFormat } from "@/lib/mock-data";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/products/best-selling")({
  component: BestSellingPage,
});

function BestSellingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBestSelling = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/products/best-selling");
      if (res.data.success) {
        setItems(res.data.data.products || []);
      }
    } catch (e) {
      toast.error("Failed to load best selling products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestSelling();
  }, []);

  const toggle = (id: string) => setItems((s) => s.map((x) => x._id === id ? { ...x, topDeal: !x.topDeal } : x));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Best Selling"
        subtitle="Curated list of top-performing products by sales volume."
      />

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No best sellers yet"
          description="Products with high sales volume will appear here automatically."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p, index) => {
            const rank = index + 1;
            const imgUrl = p.icon || (p.images && p.images.length > 0 ? p.images[0] : null);
            return (
              <Card key={p._id} className="p-5 group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-white font-bold shadow-sm shrink-0 overflow-hidden">
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        `#${rank}`
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{p.name}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">Best Seller #{rank}</Badge>
                    </div>
                  </div>
                  <Switch checked={!!p.topDeal} onCheckedChange={() => toggle(p._id)} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-semibold text-sm">{inrFormat(p.price)}</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" /> Sold</div>
                    <div className="font-semibold text-sm">{(p.unitsSold || 0).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /></div>
                    <div className="font-semibold text-sm">{p.avgRating || 0}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline" className="gap-1"><Trophy className="h-3 w-3 text-amber-500" /> Top seller</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
