import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, AlertTriangle, TrendingUp, Boxes, Loader2, Award, Calendar } from "lucide-react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/products/dashboard")({
  component: ProductsDashboard,
});

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

interface OverviewStat {
  count: number;
  change?: number;
  label?: string;
}

interface Performer {
  rank: number;
  productId: string;
  name: string;
  icon?: string | null;
  category?: string | null;
  unitsSold: number;
  revenue: number;
  unitsChange?: number;
  revenueChange?: number;
  totalStock?: number;
  stockStatus?: string;
}

interface DashboardData {
  overview: {
    totalProducts: OverviewStat;
    trending: OverviewStat;
    lowStock: OverviewStat;
    outOfStock: { count: number };
    inventoryValue: number;
  };
  topCategories: Array<{
    count: number;
    categoryId: string;
    name: string;
    percentage: number;
  }>;
  outOfStock: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
  }>;
  salesRanking: {
    sortBy: string;
    performers: Performer[];
    topPerformer: Performer | null;
  };
}

interface Category {
  _id: string;
  title: string;
}

function inrFormat(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

function ProductsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("month");
  const [selectedSort, setSelectedSort] = useState<string>("unitsSold");
  const [loading, setLoading] = useState(true);

  // Fetch Category List
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiFetch(`${API_BASE}/categories`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        let url = `${API_BASE}/products/dashboard?filter=${selectedFilter}&sortBy=${selectedSort}&limit=10`;
        if (selectedCategory !== "all") {
          url += `&categoryId=${selectedCategory}`;
        }
        const res = await apiFetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load product dashboard statistics", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [selectedCategory, selectedFilter, selectedSort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <PageHeader title="Products Overview" subtitle="Catalog health and inventory snapshot." />
        
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Time range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-semibold">Period:</span>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Sort By:</span>
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unitsSold">Units Sold</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Category:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 border rounded-xl bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground italic">Fetching dashboard health metrics…</p>
        </div>
      ) : !data ? (
        <Card className="p-20 text-center text-muted-foreground italic bg-card shadow-sm border">
          Failed to fetch dashboard data. Please try again.
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              label="Total products"
              value={data.overview.totalProducts.count}
              icon={Package}
              change={data.overview.totalProducts.change}
              hint={data.overview.totalProducts.label || "this week"}
              tone="primary"
            />
            <StatsCard
              label="Trending"
              value={data.overview.trending.count}
              icon={TrendingUp}
              change={data.overview.trending.change}
              tone="success"
            />
            <StatsCard
              label="Low stock"
              value={data.overview.lowStock.count}
              icon={AlertTriangle}
              hint={data.overview.lowStock.label || "Needs reorder"}
              tone="warning"
            />
            <StatsCard
              label="Inventory value"
              value={inrFormat(data.overview.inventoryValue)}
              icon={Boxes}
            />
          </div>

          {/* Top categories and Out of stock grids */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Top categories</h3>
              <div className="space-y-3">
                {data.topCategories.map((c) => (
                  <div key={c.categoryId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{c.name}</span>
                      <span className="text-muted-foreground font-mono">
                        {c.count} ({c.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${c.percentage}%` }} />
                    </div>
                  </div>
                ))}
                {data.topCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    No category distribution data found.
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">Out of stock ({data.overview.outOfStock.count})</h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {data.outOfStock.slice(0, 6).map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div className="text-sm min-w-0 flex-1 pr-2">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive shrink-0 font-bold uppercase tracking-wide">
                      0 left
                    </span>
                  </div>
                ))}
                {data.outOfStock.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    All products are currently in stock!
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Product Sales Ranking */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">Product Sales Ranking</h3>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Ranked by {selectedSort === "revenue" ? "Revenue" : "Units Sold"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.salesRanking.performers.map((p, i) => (
                <Card
                  key={p.productId}
                  className="p-4 relative overflow-hidden group hover:border-primary/50 transition-all flex flex-col justify-between"
                >
                  <div className="absolute -right-2 -top-2 h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xl italic opacity-50 group-hover:opacity-100 transition-opacity">
                    #{i + 1}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 pr-6">
                      {p.icon ? (
                        <img
                          src={p.icon}
                          alt={p.name}
                          className="h-9 w-9 rounded-lg object-cover border bg-muted"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Rank {i + 1}</div>
                        <div className="font-bold text-sm truncate">{p.name}</div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t pt-2 border-primary/5">
                      <div>
                        <div className="text-xl font-black">{(p.unitsSold ?? 0).toLocaleString()}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase">Units Sold</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary">{inrFormat(p.revenue)}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase text-right">Revenue</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium bg-muted/40 rounded-lg p-1.5 border border-border/20">
                      <span>Stock: {p.totalStock ?? "N/A"}</span>
                      <span className={p.stockStatus === "In Stock" ? "text-success font-semibold" : "text-destructive font-semibold"}>
                        {p.stockStatus || "N/A"}
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            data.salesRanking.performers[0]?.unitsSold
                              ? ((p.unitsSold ?? 0) / data.salesRanking.performers[0].unitsSold) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {data.salesRanking.performers.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground italic border rounded-xl bg-card">
                  No sales ranking data found for the selected options.
                </div>
              )}
            </div>
          </div>

          {/* Maximum Selling Product / Top Performer */}
          {data.salesRanking.topPerformer ? (
            <Card className="p-0 overflow-hidden bg-primary/5 border-primary/20">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 bg-muted relative overflow-hidden flex items-center justify-center border-r">
                  {data.salesRanking.topPerformer.icon ? (
                    <img
                      src={data.salesRanking.topPerformer.icon}
                      alt={data.salesRanking.topPerformer.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Award className="h-16 w-16 opacity-20 text-primary" />
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    TOP PERFORMER
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs font-bold text-success uppercase tracking-wider">
                      Maximum Selling Product
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{data.salesRanking.topPerformer.name}</h2>
                  
                  <div className="grid grid-cols-3 gap-4 border-t border-primary/10 pt-4 mt-2">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Units Sold</div>
                      <div className="text-xl font-bold text-foreground">
                        {(data.salesRanking.topPerformer.unitsSold ?? 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Revenue Generated</div>
                      <div className="text-xl font-bold text-primary">
                        {inrFormat(data.salesRanking.topPerformer.revenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Stock Status</div>
                      <div className={`text-xl font-bold ${data.salesRanking.topPerformer.stockStatus === "In Stock" ? "text-success" : "text-destructive"}`}>
                        {data.salesRanking.topPerformer.stockStatus || "In Stock"} ({data.salesRanking.topPerformer.totalStock ?? 0})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-sm text-muted-foreground italic border bg-card">
              No top performing product found.
            </Card>
          )}
        </>
      )}
    </div>
  );
}
