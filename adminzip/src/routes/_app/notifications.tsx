import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, CheckCheck, Package, ShoppingBag, AlertTriangle, Handshake, MessageSquare, Send, Smartphone, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { FormDialog, type FormField } from "@/components/form-dialog";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

interface Notif {
  _id: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  orderId?: string;
  seen: boolean;
  userType: string;
  createdAt: string;
  updatedAt: string;
}

const META: Record<string, { icon: any; tone: string; label: string }> = {
  ORDER_SHIPPED:  { icon: ShoppingBag,    tone: "text-info bg-info/10",         label: "Order"  },
  ORDER_CONFIRMED:{ icon: ShoppingBag,    tone: "text-info bg-info/10",         label: "Order"  },
  STOCK:          { icon: AlertTriangle,  tone: "text-warning bg-warning/10",   label: "Stock"  },
  KYC:            { icon: Handshake,      tone: "text-primary bg-primary/10",   label: "KYC"    },
  REVIEW:         { icon: MessageSquare,  tone: "text-success bg-success/10",   label: "Review" },
  SYSTEM:         { icon: Package,        tone: "text-muted-foreground bg-muted", label: "System" },
};

const getFallbackMeta = (type: string) => {
  return META[type] || { icon: Bell, tone: "text-muted-foreground bg-muted", label: type || "Alert" };
};

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("dsm_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [users, setUsers] = useState<{ _id: string, name?: string, firstName?: string, email?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [activeTab, setActiveTab] = useState<"auto" | "custom">("auto");
  const [openSend, setOpenSend] = useState(false);
  const [openBroadcast, setOpenBroadcast] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/notification/admin/all?page=1&limit=50`, {
        headers: { ...getAuthHeader() }
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
      } else {
        toast.error(json.message || "Failed to load notifications");
      }
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users?limit=1000`, {
        headers: { ...getAuthHeader() }
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, [fetchNotifications, fetchUsers]);

  const visible = filter === "unread" ? items.filter((n) => !n.seen) : items;
  const unreadCount = items.filter((n) => !n.seen).length;

  const markAll = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notification/mark-all-seen`, {
        method: "PATCH",
        headers: { ...getAuthHeader() }
      });
      const json = await res.json();
      if (json.success) {
        setItems((p) => p.map((n) => ({ ...n, seen: true })));
        toast.success(json.message || "All marked as read");
      } else {
        toast.error(json.message || "Failed to mark all as seen");
      }
    } catch (err) {
      toast.error("Failed to mark all as seen");
    }
  };

  const toggle = async (n: Notif) => {
    if (n.seen) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/notification/${n._id}/seen`, {
        method: "PATCH",
        headers: { ...getAuthHeader() }
      });
      const json = await res.json();
      if (json.success || json.message) {
        setItems((p) => p.map((it) => it._id === n._id ? { ...it, seen: true } : it));
      } else {
        toast.error(json.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const updateFcmToken = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notification/fcm-token`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify({ fcmToken: "DUMMY_FCM_DEVICE_TOKEN_FOR_TESTING" })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "FCM token updated successfully");
      } else {
        toast.error(json.message || "Failed to update FCM token");
      }
    } catch (err) {
      toast.error("Failed to update FCM token");
    }
  };

  const onSendSubmit = async (v: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notification/admin/send-to-user`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader() 
        },
        body: JSON.stringify(v)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Notification sent successfully");
        setOpenSend(false);
        fetchNotifications();
      } else {
        toast.error(json.message || "Failed to send notification");
      }
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const onBroadcastSubmit = async (v: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notification/admin/broadcast`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader() 
        },
        body: JSON.stringify(v)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Broadcast sent successfully");
        setOpenBroadcast(false);
        fetchNotifications();
      } else {
        toast.error(json.message || "Failed to send broadcast");
      }
    } catch (error) {
      toast.error("Failed to send broadcast");
    }
  };

  const sendFields: FormField[] = useMemo(() => {
    const userOptions = users.map(u => ({
      label: `${u.name || u.firstName || 'User'} (${u.email || u._id})`,
      value: u._id
    }));

    return [
      { 
        name: "userId", 
        label: "User", 
        type: "select", 
        options: userOptions, 
        required: true,
        placeholder: "Select user..."
      },
      { name: "title", label: "Title", required: true },
      { name: "message", label: "Message", type: "textarea", required: true, rows: 4 },
      { name: "type", label: "Type (e.g. SYSTEM, ORDER_CONFIRMED)", required: true },
    ];
  }, [users]);

  const broadcastFields: FormField[] = [
    { name: "title", label: "Broadcast Title", required: true, placeholder: "e.g. Big Sale is Live!" },
    { name: "message", label: "Message", type: "textarea", required: true, rows: 4, placeholder: "Up to 50% off on all products. Shop now!" },
    { 
      name: "type", 
      label: "Notification Type", 
      type: "select", 
      required: true, 
      options: [
        { label: "Promotional", value: "PROMOTIONAL" },
        { label: "System", value: "SYSTEM" },
        { label: "Update", value: "UPDATE" },
      ]
    },
  ];

  const renderNotificationList = () => {
    if (loading) {
      return (
        <Card className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </Card>
      );
    }
    
    if (visible.length === 0) {
      return (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="No notifications match this filter. New events will appear here."
        />
      );
    }

    return (
      <Card className="divide-y overflow-hidden">
        {visible.map((n) => {
          const m = getFallbackMeta(n.type);
          const Icon = m.icon;
          return (
            <div key={n._id} className={cn("flex items-start gap-3 p-4 transition-colors hover:bg-accent/40", !n.seen && "bg-primary/[0.04]")}>
              <div className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", m.tone)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{n.title}</span>
                  <Badge variant="outline" className="h-5 text-[10px] uppercase">{m.label}</Badge>
                  {!n.seen && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!n.seen && (
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => toggle(n)}>
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="System alerts, orders, stock and account events."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border bg-background p-0.5">
              <Button size="sm" variant={filter === "all" ? "secondary" : "ghost"} className="h-7 px-3" onClick={() => setFilter("all")}>All</Button>
              <Button size="sm" variant={filter === "unread" ? "secondary" : "ghost"} className="h-7 px-3" onClick={() => setFilter("unread")}>
                Unread {unreadCount > 0 && <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">{unreadCount}</Badge>}
              </Button>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" disabled={unreadCount === 0} onClick={markAll}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
            <Button size="sm" onClick={() => setOpenSend(true)} className="gap-1.5" variant="outline">
              <Send className="h-4 w-4" /> Send Alert
            </Button>
            <Button size="sm" onClick={() => setOpenBroadcast(true)} className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white border-0">
              <Megaphone className="h-4 w-4" /> Broadcast
            </Button>
            <Button size="sm" variant="outline" onClick={updateFcmToken} className="gap-1.5">
              <Smartphone className="h-4 w-4" /> Update FCM
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "auto" | "custom")} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="auto" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            All Alerts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="auto" className="mt-0">
          {renderNotificationList()}
        </TabsContent>
      </Tabs>
      
      <FormDialog
        open={openSend}
        onOpenChange={setOpenSend}
        title="Send Notification to User"
        fields={sendFields}
        defaultValues={{ type: "ORDER_CONFIRMED" }}
        onSubmit={onSendSubmit}
      />

      <FormDialog
        open={openBroadcast}
        onOpenChange={setOpenBroadcast}
        title="Broadcast Notification to All Users"
        fields={broadcastFields}
        defaultValues={{ type: "PROMOTIONAL" }}
        onSubmit={onBroadcastSubmit}
      />
    </div>
  );
}

