import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Crown, Star, Sparkles, Pencil, Trash2, Users as UsersIcon, Download, TrendingUp, CreditCard } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { apiFetch } from "@/lib/api";
import { StatsSkeleton, CardGridSkeleton } from "@/components/loading-skeletons";
import { EmptyState } from "@/components/empty-state";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/users/membership")({
  component: MembershipPage,
});

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";
const API = `${API_BASE}/membership`;

interface Plan {
  id: string;
  name: string;
  tier: "Silver" | "Gold" | "Platinum";
  price: number;
  duration: "Monthly" | "Quarterly" | "Yearly";
  discount: number;
  perks: string[];
  pointsMultiplier: number;
  shippingType: string;
  active: boolean;
}

const TIER_META: Record<Plan["tier"], { icon: typeof Crown; gradient: string }> = {
  Silver:   { icon: Star,     gradient: "from-slate-400 to-slate-600" },
  Gold:     { icon: Sparkles, gradient: "from-amber-400 to-orange-500" },
  Platinum: { icon: Crown,    gradient: "from-violet-500 to-fuchsia-600" },
};

function mapBackendPlan(p: any): Plan {
  let tier: Plan["tier"] = "Silver";
  if (p.tier?.toLowerCase() === "gold") tier = "Gold";
  if (p.tier?.toLowerCase() === "platinum") tier = "Platinum";

  let duration: Plan["duration"] = "Monthly";
  if (p.billing_cycle?.toLowerCase() === "quarterly") duration = "Quarterly";
  if (p.billing_cycle?.toLowerCase() === "yearly") duration = "Yearly";

  return {
    id: p._id,
    name: p.name,
    tier,
    price: p.price,
    duration,
    discount: p.discount_percent || 0,
    perks: Array.isArray(p.perks) ? p.perks : [],
    pointsMultiplier: p.points_multiplier || 1,
    shippingType: p.shipping_type || "standard",
    active: p.is_active,
  };
}

export function MembershipPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Plan[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState("plans");
  const [stats, setStats] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch(`${API}/admin/stats`);
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/plans`);
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.map(mapBackendPlan));
      }
    } catch {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // Toggle active via PATCH API
  const handleToggle = async (plan: Plan) => {
    try {
      const res = await apiFetch(`${API}/admin/plans/${plan.id}/toggle`, { method: "PATCH" });
      const json = await res.json();
      if (json.success) {
        setItems((s) => s.map((x) => x.id === plan.id ? { ...x, active: json.data.is_active } : x));
        toast.success(json.message || "Plan toggled");
      } else {
        toast.error(json.message || "Toggle failed");
      }
    } catch {
      toast.error("Failed to toggle plan");
    }
  };

  // Delete via DELETE API
  const handleDelete = async (plan: Plan) => {
    try {
      const res = await apiFetch(`${API}/admin/plans/${plan.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setItems((s) => s.filter((x) => x.id !== plan.id));
        toast.success(`Deleted "${plan.name}"`);
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const totalMembers = stats?.totalMembers || 0;
  const activePlans = items.filter((p) => p.active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership"
        subtitle="Subscription plans, perks and active subscribers."
        actions={
          activeTab === "plans" && (
            <Button className="gap-1.5" onClick={() => { setEditing(null); setDrawerOpen(true); }}>
              <Plus className="h-4 w-4" /> New plan
            </Button>
          )
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-6">

      {loading ? (
        <>
          <StatsSkeleton count={4} />
          <CardGridSkeleton count={4} />
        </>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Active Plans" value={String(activePlans)} icon={Sparkles} tone="default" />
            <StatsCard label="Total Plans" value={String(items.length)} icon={Star} tone="default" />
            <StatsCard label="Total Members" value={String(totalMembers)} icon={UsersIcon} tone="primary" />
            <StatsCard label="Tiers" value="3" icon={Crown} tone="success" />
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={Crown}
              title="No membership plans yet"
              description="Create your first subscription tier to start enrolling members."
              action={
                <Button className="gap-1.5" onClick={() => { setEditing(null); setDrawerOpen(true); }}>
                  <Plus className="h-4 w-4" /> New plan
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((p) => {
                const meta = TIER_META[p.tier];
                const Icon = meta.icon;
                return (
                  <Card key={p.id} className="p-0 overflow-hidden flex flex-col group">
                    <div className={`h-24 bg-gradient-to-br ${meta.gradient} relative flex items-center justify-center`}>
                      <Icon className="h-10 w-10 text-white drop-shadow" />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-white/20 text-white border-white/30">{p.tier}</Badge>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{p.name}</h3>
                        <Switch checked={p.active} onCheckedChange={() => handleToggle(p)} />
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-semibold">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-muted-foreground">/ {p.duration.toLowerCase()}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div><span className="font-medium text-foreground">{p.discount}%</span> discount</div>
                        <div><span className="font-medium text-foreground">{p.perks.length}</span> perks</div>
                        <div><span className="font-medium text-foreground">{p.pointsMultiplier}x</span> points</div>
                        <div><span className="font-medium text-foreground capitalize">{p.shippingType}</span> ship</div>
                      </div>
                      {p.perks.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {p.perks.map((perk, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="text-green-500">✓</span> {perk}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-auto pt-4 flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(p); setDrawerOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
      </TabsContent>

      <TabsContent value="subscribers">
        <SubscribersTab />
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsTab stats={stats} />
      </TabsContent>
    </Tabs>

      <PlanDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        plan={editing}
        onSaved={() => { fetchPlans(); setDrawerOpen(false); }}
      />
    </div>
  );
}

/* ─── Plan Create / Edit Drawer ────────────────────────────────────── */
function PlanDrawer({
  open, onOpenChange, plan, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: Plan | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<string>("silver");
  const [price, setPrice] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<string>("monthly");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [pointsMultiplier, setPointsMultiplier] = useState<number>(1);
  const [shippingType, setShippingType] = useState<string>("standard");
  const [perksInput, setPerksInput] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(plan?.name ?? "");
      setTier(plan?.tier?.toLowerCase() ?? "silver");
      setPrice(plan?.price ?? 0);
      setBillingCycle(plan?.duration?.toLowerCase() ?? "monthly");
      setDiscountPercent(plan?.discount ?? 0);
      setPointsMultiplier(plan?.pointsMultiplier ?? 1);
      setShippingType(plan?.shippingType ?? "standard");
      setPerksInput(plan?.perks?.join(", ") ?? "");
      setIsActive(plan?.active ?? true);
    }
  }, [open, plan]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Plan name is required"); return; }
    if (!price) { toast.error("Price is required"); return; }

    const perks = perksInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      name: name.trim(),
      tier,
      price,
      billing_cycle: billingCycle,
      discount_percent: discountPercent,
      points_multiplier: pointsMultiplier,
      shipping_type: shippingType,
      perks,
      is_active: isActive,
    };

    try {
      setSaving(true);
      const url = plan
        ? `${API}/admin/plans/${plan.id}`
        : `${API}/admin/plans`;
      const method = plan ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || (plan ? "Plan updated" : "Plan created"));
        onSaved();
      } else {
        toast.error(json.message || "Save failed");
      }
    } catch {
      toast.error("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{plan ? "Edit Plan" : "New Membership Plan"}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Plan Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gold Monthly" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tier *</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Billing Cycle *</Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Discount (%)</Label>
              <Input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(+e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Points Multiplier</Label>
              <Input type="number" step="0.1" value={pointsMultiplier} onChange={(e) => setPointsMultiplier(+e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shipping Type</Label>
              <Select value={shippingType} onValueChange={setShippingType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="next-day">Next Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Perks <span className="text-muted-foreground text-xs">(comma separated)</span></Label>
            <Input
              value={perksInput}
              onChange={(e) => setPerksInput(e.target.value)}
              placeholder="Free shipping, 15% off coupon, Priority Support"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label>Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : plan ? "Save changes" : "Create Plan"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Subscribers Tab ──────────────────────────────────────────────── */
function SubscribersTab() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/admin/subscribers?limit=100`);
      const json = await res.json();
      if (json.success && json.data) {
        setSubscribers(json.data.subscribers || json.data);
      }
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleExport = async () => {
    try {
      const res = await apiFetch(`${API}/admin/subscribers/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscribers.csv";
      a.click();
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No subscribers found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-medium">{s.userId?.firstName || 'Unknown'} {s.userId?.lastName || ''}</div>
                    <div className="text-xs text-muted-foreground">{s.userId?.email || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.planId?.name || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

/* ─── Analytics Tab ────────────────────────────────────────────────── */
function AnalyticsTab({ stats }: { stats: any }) {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [revRes, txRes] = await Promise.all([
          apiFetch(`${API}/admin/revenue`),
          apiFetch(`${API}/admin/transactions?limit=10`)
        ]);
        const revJson = await revRes.json();
        const txJson = await txRes.json();
        
        if (revJson.success) setRevenueData(revJson.data);
        if (txJson.success) setTransactions(txJson.data.transactions || txJson.data);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} tone="primary" />
        <StatsCard label="Active Members" value={String(stats?.totalMembers || 0)} icon={UsersIcon} tone="success" />
        <StatsCard label="Total Plans" value={String(stats?.totalPlans || 0)} icon={Crown} tone="default" />
        <StatsCard label="Transactions" value={String(transactions.length)} icon={CreditCard} tone="default" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Revenue History (Recent)</h3>
          {loading ? (
             <div className="h-32 flex items-center justify-center text-muted-foreground">Loading chart...</div>
          ) : revenueData.length === 0 ? (
             <div className="h-32 flex items-center justify-center text-muted-foreground">No revenue data.</div>
          ) : (
            <div className="space-y-3">
              {revenueData.slice(0, 5).map((r, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{r.month}/{r.year}</span>
                  <span className="text-sm font-bold text-green-600">₹{(r.revenue || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">No transactions found.</div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((t, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="text-sm font-medium">{t.userId?.firstName || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">₹{t.amount}</div>
                    <Badge variant="outline" className="text-[10px] uppercase">{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
