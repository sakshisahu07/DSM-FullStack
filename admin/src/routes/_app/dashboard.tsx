import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IndianRupee, ShoppingBag, Users as UsersIcon, Handshake, FileWarning,
  Wallet, AlertTriangle, Clock, Plus, Zap, CheckCircle2, Send, FileText, Link as LinkIcon,
  Package, Megaphone, ShoppingCart, Building2,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { StatusBadge } from "@/components/status-badge";
import { DashboardFilters } from "@/components/dashboard-filters";
import { inrFormat } from "@/lib/mock-data";
import { apiFetch, API_BASE_URL } from "@/lib/api";

const API_BASE = API_BASE_URL;

/* ── Types ── */
interface DashboardCards {
  products: { totalSKUs: number; lowStock: number; change: number };
  marketing: { activeFlashSales: number; activeCombos: number; change: number };
  orders: { pending: number; today: number; change: number };
  affiliates: { totalAffiliates: number; activeAffiliates: number; pendingKYC: number; totalPayouts: number; change: number };
  b2b: { totalInquiries: number; unread: number; change: number };
  users: { totalUsers: number; activeUsers: number; newToday: number; change: number };
}

interface DashboardSummary {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersThisWeek: number;
  totalUsers: number;
  userGrowth: number;
  totalAffiliates: number;
  activeAffiliates: number;
  pendingKYC: number;
  walletBalance: number;
  lowStock: number;
  pendingOrders: number;
}

interface RevenueTrend {
  revenue: number;
  orders: number;
  date: string;
}

interface OrderStatusDistribution {
  count: number;
  status: string;
}

interface PaymentMethodSplit {
  count: number;
  method: string;
}

interface TopSellingProduct {
  totalSold: number;
  productId: string;
  name: string;
}

interface RecentOrder {
  _id: string;
  customerId: { _id: string; email: string };
  orderTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [filter, setFilter] = useState("all_time");
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<DashboardCards | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [orderStatusDist, setOrderStatusDist] = useState<any[]>([]);
  const [paymentSplit, setPaymentSplit] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const fetchData = async (currentFilter: string) => {
    try {
      setLoading(true);
      const query = `?filter=${currentFilter}`;
      const [resDash, resCharts, resOrders] = await Promise.all([
        apiFetch(`${API_BASE}/dashboard${query}`),
        apiFetch(`${API_BASE}/dashboard/revenue-chart${query}`),
        apiFetch(`${API_BASE}/dashboard/recent-orders${query}`),
      ]);

      const [jsonDash, jsonCharts, jsonOrders] = await Promise.all([
        resDash.json(),
        resCharts.json(),
        resOrders.json(),
      ]);

      if (jsonDash.success) {
        setCards(jsonDash.cards);
        setSummary(jsonDash.summary);
      }

      if (jsonCharts.success) {
        // Transform revenue trend
        setRevenueTrend(
          (jsonCharts.revenueTrend || []).map((d: RevenueTrend) => ({
            day: d.date ? new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A",
            revenue: d.revenue || 0,
          }))
        );

        // Transform order status distribution
        const statusColors: Record<string, string> = {
          ORDERED: "var(--chart-1)",
          CANCELLED: "var(--chart-5)",
          PENDING: "var(--chart-4)",
          DELIVERED: "var(--chart-3)",
          SHIPPING: "var(--chart-2)",
        };
        setOrderStatusDist(
          (jsonCharts.orderStatusDistribution || []).map((d: OrderStatusDistribution) => ({
            name: d.status || "Unknown",
            value: d.count || 0,
            color: statusColors[d.status] || "var(--chart-1)",
          }))
        );

        // Transform payment method split
        const methodColors: Record<string, string> = {
          COD: "var(--chart-4)",
          ONLINE: "var(--chart-1)",
          WALLET: "var(--chart-3)",
        };
        setPaymentSplit(
          (jsonCharts.paymentMethodSplit || []).map((d: PaymentMethodSplit) => ({
            name: d.method || "Other",
            value: d.count || 0,
            color: methodColors[d.method] || "var(--chart-2)",
          }))
        );

        // Transform top selling
        setTopSelling(
          (jsonCharts.topSellingProducts || []).map((d: TopSellingProduct) => ({
            name: d.name || "Unknown Product",
            sold: d.totalSold || 0,
          }))
        );
      }

      if (jsonOrders.success) {
        setRecentOrders(jsonOrders.orders || []);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your store, orders, affiliates and operations."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => fetchData(filter)}>Refresh</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Product</Button>
          </>
        }
      />

      <DashboardFilters filter={filter} onFilterChange={setFilter} />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <StatsCard label="Total Revenue" value={inrFormat(summary?.totalRevenue || 0)} change={summary?.revenueChange} icon={IndianRupee} tone="primary" hint="vs last period" />
        <StatsCard label="Total Orders" value={summary?.totalOrders?.toLocaleString() || "0"} change={0} icon={ShoppingBag} tone="default" hint="total" />
        <StatsCard label="Total Users" value={summary?.totalUsers?.toLocaleString() || "0"} change={summary?.userGrowth} icon={UsersIcon} tone="success" hint="growth" />
        <StatsCard label="Total Affiliates" value={summary?.totalAffiliates?.toLocaleString() || "0"} change={0} icon={Handshake} tone="default" hint={`${summary?.activeAffiliates} active`} />
        <StatsCard label="Pending KYC" value={summary?.pendingKYC?.toLocaleString() || "0"} change={0} icon={FileWarning} tone="warning" hint="needs review" />
        <StatsCard label="Wallet Balance" value={inrFormat(summary?.walletBalance || 0)} change={0} icon={Wallet} tone="default" />
        <StatsCard label="Low Stock" value={summary?.lowStock?.toLocaleString() || "0"} change={0} icon={AlertTriangle} tone="danger" hint="restock soon" />
        <StatsCard label="Pending Orders" value={summary?.pendingOrders?.toLocaleString() || "0"} change={0} icon={Clock} tone="warning" hint="awaiting action" />
      </div>

      {/* Quick actions */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { i: Plus, l: "Add New Product" },
            { i: Zap, l: "Create Flash Sale" },
            { i: CheckCircle2, l: "Approve KYC" },
            { i: Send, l: "Process Payout" },
            { i: FileText, l: "Bulk Inquiries" },
            { i: LinkIcon, l: "Add Combo Offer" },
          ].map((a) => (
            <Button key={a.l} variant="outline" size="sm" className="gap-1.5">
              <a.i className="h-4 w-4" /> {a.l}
            </Button>
          ))}
        </div>
      </Card>

      {/* Module overview */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards && (
          <>
            <ModuleCard icon={Package} title="Products" primary={`${cards.products.totalSKUs} SKUs`} secondary={`${cards.products.lowStock} low stock`} trend={cards.products.change} link="/products/all" />
            <ModuleCard icon={Megaphone} title="Marketing" primary={`${cards.marketing.activeFlashSales} Flash Sales`} secondary={`${cards.marketing.activeCombos} active combos`} trend={cards.marketing.change} link="/marketing/flash-sales" />
            <ModuleCard icon={ShoppingCart} title="Orders" primary={`${cards.orders.pending} Pending`} secondary={`${cards.orders.today} today`} trend={cards.orders.change} link="/orders/all" />
            <ModuleCard icon={Handshake} title="Affiliates" primary={`${cards.affiliates.activeAffiliates} Active`} secondary={`${inrFormat(cards.affiliates.totalPayouts)} payouts`} trend={cards.affiliates.change} link="/affiliate/all" />
            <ModuleCard icon={Building2} title="B2B" primary={`${cards.b2b.totalInquiries} Inquiries`} secondary={`${cards.b2b.unread} unread`} trend={cards.b2b.change} link="/b2b/inquiries" />
            <ModuleCard icon={UsersIcon} title="Users" primary={`${cards.users.newToday} New today`} secondary={`${cards.users.totalUsers} total`} trend={cards.users.change} link="/users/all" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Recent trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order Status Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={orderStatusDist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {orderStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Selling Products">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topSelling} layout="vertical" margin={{ top: 5, right: 15, left: 90, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} width={120} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="sold" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Method Split">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentSplit} dataKey="value" nameKey="name" outerRadius={95}>
                {paymentSplit.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent activity tabs */}
      <Card className="p-0 overflow-hidden">
        <Tabs defaultValue="orders" className="w-full">
          <div className="border-b px-4 pt-3">
            <TabsList>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="affiliates">New Affiliates</TabsTrigger>
              <TabsTrigger value="b2b">Bulk Inquiries</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead><TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead><TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell className="font-mono text-xs">{o._id.slice(-8)}</TableCell>
                    <TableCell>{o.customerId?.email || "Guest"}</TableCell>

                    <TableCell>{inrFormat(o.orderTotal)}</TableCell>
                    <TableCell><StatusBadge variant={statusVariant(o.status.toLowerCase())}>{o.status}</StatusBadge></TableCell>
                    <TableCell><StatusBadge variant="info">{o.paymentMethod}</StatusBadge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="affiliates" className="m-0">
            <div className="py-10 text-center text-muted-foreground text-sm">
              New affiliates logic will be integrated soon.
            </div>
          </TabsContent>

          <TabsContent value="b2b" className="m-0">
            <div className="py-10 text-center text-muted-foreground text-sm">
              Bulk inquiries logic will be integrated soon.
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function statusVariant(s: string): "success" | "warning" | "info" | "danger" | "default" | "primary" {
  if (s === "delivered" || s === "ordered") return "success";
  if (s === "shipping" || s === "processing") return "info";
  if (s === "placed" || s === "confirmed" || s === "pending") return "warning";
  if (s === "cancelled") return "danger";
  return "default";
}

function ModuleCard({ icon: Icon, title, primary, secondary, trend, link }: {
  icon: any; title: string; primary: string; secondary: string; trend: number; link: string;
}) {
  const positive = trend >= 0;
  return (
    <Card className="p-5 group hover:border-primary/40 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? "+" : ""}{trend}%
        </span>
      </div>
      <div className="font-semibold text-base">{title}</div>
      <div className="mt-3 space-y-1">
        <div className="text-2xl font-semibold tracking-tight">{primary}</div>
        <div className="text-xs text-muted-foreground">{secondary}</div>
      </div>
      <Button variant="ghost" size="sm" asChild className="mt-4 -ml-2 text-primary hover:text-primary">
        <a href={link}>View dashboard →</a>
      </Button>
    </Card>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-3">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </Card>
  );
}

