import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Eye, Download, Star, Loader2, Award, FolderKanban, MessageSquare, Plus, Clock, TrendingUp } from "lucide-react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/projects/dashboard")({
  component: ProjectsDashboard,
});

const API_BASE = import.meta.env.VITE_API_URL || "https://priyashu.in/api/v1";

interface ProjectPerformer {
  rank: number;
  projectId: string;
  title: string;
  icon?: string | null;
  category?: string | null;
  projectType: string;
  mrp: number;
  finalPrice: number;
  discount: number;
  totalViews: number;
  totalDownloads: number;
  avgRating: number;
  totalRatings: number;
  viewsVsAvg?: number;
  downloadsVsAvg?: number;
}

interface ProjectDashboardData {
  success: boolean;
  cards: {
    catalog: {
      totalProjects: { count: number; change: number };
      byLevel: { beginner: number; intermediate: number; advance: number };
      disabled: { count: number };
      catalogValue: number;
      revenueValue: number;
    };
    engagement: {
      views: { current: number; previous: number; total: number; change: number };
      downloads: { current: number; previous: number; total: number; change: number };
      ratings: { current: number; previous: number; total: number; avgRating: number; change: number };
    };
  };
  summary: {
    totalProjects: number;
    projectChange: number;
    catalogValue: number;
    disabled: number;
    byLevel: { beginner: number; intermediate: number; advance: number };
    totalViews: number;
    viewsChange: number;
    totalDownloads: number;
    downloadsChange: number;
    avgRating: number;
    totalRatings: number;
    ratingsChange: number;
  };
  topCategories: Array<{
    count: number;
    categoryId: string;
    name: string;
    percentage: number;
  }>;
  topPerformers: {
    sortBy: string;
    performers: ProjectPerformer[];
    topProject: ProjectPerformer | null;
  };
  recentProjects: Array<{
    _id: string;
    title: string;
    projectType: string;
    icon?: string | null;
    rating: number;
    totalRatings: number;
    totalViews: number;
    totalDownloads: number;
    mrp: number;
    discount: number;
    finalPrice: number;
    createdAt: string;
  }>;
  recentRatings: Array<{
    _id: string;
    project: { title: string } | null;
    user: { name: string } | null;
    rating: number;
    review: string;
    createdAt: string;
  }>;
}

function inrFormat(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

function ProjectsDashboard() {
  const [data, setData] = useState<ProjectDashboardData | null>(null);
  const [sortBy, setSortBy] = useState<string>("downloads");
  const [loading, setLoading] = useState(true);

  // Fetch Projects Dashboard Data
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE}/projects/dashboard?sortBy=${sortBy}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load project dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title="Projects Overview" subtitle="Projects health, download statistics, and curriculum insights." />
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground font-semibold">Rank by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Downloads" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="views">Views</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 border rounded-xl bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground italic">Fetching project curriculum stats…</p>
        </div>
      ) : !data ? (
        <Card className="p-20 text-center text-muted-foreground italic bg-card shadow-sm border">
          Failed to fetch project dashboard metrics. Please reload.
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              label="Total Projects"
              value={data.summary.totalProjects}
              icon={Briefcase}
              change={data.summary.projectChange}
              tone="primary"
            />
            <StatsCard
              label="Catalog Value"
              value={inrFormat(data.summary.catalogValue)}
              icon={FolderKanban}
            />
            <StatsCard
              label="Total Views"
              value={data.summary.totalViews}
              icon={Eye}
              change={data.summary.viewsChange}
              tone="success"
            />
            <StatsCard
              label="Total Downloads"
              value={data.summary.totalDownloads}
              icon={Download}
              change={data.summary.downloadsChange}
              tone="warning"
            />
          </div>

          {/* Difficulty and Categories Grids */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Project levels */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Projects by Difficulty</h3>
              <div className="space-y-4">
                {[
                  { label: "Beginner", count: data.summary.byLevel.beginner },
                  { label: "Intermediate", count: data.summary.byLevel.intermediate },
                  { label: "Advanced", count: data.summary.byLevel.advance },
                ].map((item) => {
                  const total = data.summary.totalProjects || 1;
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="text-muted-foreground font-mono font-semibold">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Top categories */}
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
                    No project categories distribution found.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Project Sales/Downloads Ranking */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">Project Ranking</h3>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Ranked by {sortBy === "views" ? "Views" : "Downloads"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.topPerformers.performers.map((p, i) => (
                <Card
                  key={p.projectId}
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
                          alt={p.title}
                          className="h-9 w-9 rounded-lg object-cover border bg-muted"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                          <Briefcase className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase capitalize">{p.projectType}</div>
                        <div className="font-bold text-sm truncate">{p.title}</div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t pt-2 border-primary/5">
                      <div>
                        <div className="text-lg font-black">{p.totalDownloads.toLocaleString()}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-0.5">
                          <Download className="w-2.5 h-2.5" /> Downloads
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-right">{p.totalViews.toLocaleString()}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase text-right flex items-center gap-0.5 justify-end">
                          <Eye className="w-2.5 h-2.5" /> Views
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium bg-muted/40 rounded-lg p-1.5 border border-border/20">
                      <span>MRP: ₹{p.mrp}</span>
                      <span className="font-semibold text-primary">Price: ₹{p.finalPrice}</span>
                    </div>

                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            sortBy === "views"
                              ? (p.totalViews / (Math.max(...data.topPerformers.performers.map((x) => x.totalViews)) || 1)) * 100
                              : (p.totalDownloads / (Math.max(...data.topPerformers.performers.map((x) => x.totalDownloads)) || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {data.topPerformers.performers.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground italic border rounded-xl bg-card">
                  No performer details found.
                </div>
              )}
            </div>
          </div>

          {/* Top Performer Card */}
          {data.topPerformers.topProject ? (
            <Card className="p-0 overflow-hidden bg-primary/5 border-primary/20">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 bg-muted relative overflow-hidden flex items-center justify-center border-r">
                  {data.topPerformers.topProject.icon ? (
                    <img
                      src={data.topPerformers.topProject.icon}
                      alt={data.topPerformers.topProject.title}
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
                      Maximum Selected Project
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{data.topPerformers.topProject.title}</h2>
                  
                  <div className="grid grid-cols-4 gap-4 border-t border-primary/10 pt-4 mt-2">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Total Downloads</div>
                      <div className="text-lg font-bold text-foreground">
                        {data.topPerformers.topProject.totalDownloads}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Total Views</div>
                      <div className="text-lg font-bold">
                        {data.topPerformers.topProject.totalViews}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Average Rating</div>
                      <div className="text-lg font-bold text-yellow-500 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" /> {data.topPerformers.topProject.avgRating || "0.0"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Project Price</div>
                      <div className="text-lg font-bold text-primary">
                        ₹{data.topPerformers.topProject.finalPrice}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-sm text-muted-foreground italic border bg-card">
              No top performing project found.
            </Card>
          )}

          {/* Recent Projects and Reviews */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent projects */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Recent Projects
                </h3>
              </div>
              <div className="space-y-3">
                {data.recentProjects.map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border/40 transition-colors">
                    <div className="text-sm min-w-0 flex-1 pr-2">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 capitalize">
                        <span>{p.projectType}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" /> {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-primary">₹{p.finalPrice}</div>
                      {p.discount > 0 && (
                        <div className="text-[10px] text-destructive line-through">₹{p.mrp}</div>
                      )}
                    </div>
                  </div>
                ))}
                {data.recentProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    No recent projects added.
                  </p>
                )}
              </div>
            </Card>

            {/* Recent ratings */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Student Reviews
                </h3>
              </div>
              <div className="space-y-3">
                {data.recentRatings.map((r) => (
                  <div key={r._id} className="p-3 rounded-lg bg-muted/40 border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {r.user?.name || "Anonymous Student"}
                      </span>
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < r.rating ? "fill-current" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      "{r.review || "No review comment provided."}"
                    </p>
                    {r.project && (
                      <div className="text-[10px] text-primary/70 font-semibold uppercase tracking-wider mt-1">
                        Project: {r.project.title}
                      </div>
                    )}
                  </div>
                ))}
                {data.recentRatings.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    No reviews received yet.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
