import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Calendar, Package } from "lucide-react";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import { EmptyState } from "@/components/empty-state";
import { inrFormat } from "@/lib/mock-data";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/products/new-arrival")({
  component: NewArrivalPage,
});

function NewArrivalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/products/new-arrivals");
      if (res.data.success) {
        setItems(res.data.data.products || []);
      }
    } catch (e) {
      toast.error("Failed to load new arrivals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const toggle = (id: string) => setItems((s) => s.map((x) => x._id === id ? { ...x, disable: !x.disable } : x));

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Arrivals"
        subtitle="Recently added products highlighted on the storefront."
      />

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No new arrivals"
          description="Recently launched products will automatically appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => {
            const imgUrl = p.icon || (p.images && p.images.length > 0 ? p.images[0] : null);
            const arrivalDate = p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "";
            return (
              <Card key={p._id} className="p-0 overflow-hidden flex flex-col group">
                <div className="h-28 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 relative grid place-items-center">
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" />
                  ) : null}
                  <Package className="h-10 w-10 text-white drop-shadow z-10" />
                  <Badge className="absolute top-2 left-2 bg-white text-emerald-700 hover:bg-white gap-1 z-10"><Sparkles className="h-3 w-3" /> NEW</Badge>
                  <Switch className="absolute top-2 right-2 z-10" checked={!p.disable} onCheckedChange={() => toggle(p._id)} />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs">New Product</Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold">{inrFormat(p.price)}</div>
                      {p.discount > 0 && <div className="text-xs text-success">{p.discount}% OFF</div>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 italic line-clamp-2">“{p.description || "Fresh from the catalog"}”</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {arrivalDate}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
