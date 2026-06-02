import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Search, Phone, Eye, MessageSquare, Clock, Filter,
  ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { TicketChatDialog } from "@/components/layout/ticket-chat-dialog";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/support")({
  component: SupportPage,
});

const API_BASE = API_BASE_URL;

/* ── Types ── */
interface Message {
  role: "original" | "user" | "support";
  text: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  user: { name: string; phone: string; avatar?: string };
  category: { label: string; type: "GENERAL" | "CALLBACK" | "TRANSACTION" };
  subject: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "Open" | "Closed" | "In Progress";
  replies: number;
  date: string;
  time: string;
  lastMessage: string;
  messages: Message[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Helpers ── */
function mapStatus(raw: string): "Open" | "Closed" | "In Progress" {
  const s = (raw || "").toLowerCase().replace("-", "_");
  if (s === "completed" || s === "closed" || s === "resolved") return "Closed";
  if (s === "in_progress" || s === "in progress") return "In Progress";
  return "Open"; // open, pending, etc.
}

function mapPriority(raw: string): "LOW" | "MEDIUM" | "HIGH" {
  const p = (raw || "").toLowerCase();
  if (p === "high") return "HIGH";
  if (p === "low") return "LOW";
  return "MEDIUM";
}

function mapCategory(raw: string): { label: string; type: "GENERAL" | "CALLBACK" | "TRANSACTION" } {
  const c = (raw || "").toUpperCase();
  if (c === "CALLBACK") return { label: "CALLBACK", type: "CALLBACK" };
  if (c === "TRANSACTION") return { label: "TRANSACTION", type: "TRANSACTION" };
  return { label: c || "GENERAL", type: "GENERAL" };
}

function formatDate(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

function mapApiTicket(raw: any): Ticket {
  const { date, time } = formatDate(raw.createdAt || raw.date || "");

  // Backend populates userId as object with firstName/lastName/number
  const userObj = raw.userId || raw.user || {};
  const firstName = userObj.firstName || "";
  const lastName = userObj.lastName || "";
  const userName = (firstName + " " + lastName).trim() ||
    userObj.name || raw.userName || raw.name || "Unknown";
  const userPhone = userObj.number || userObj.phone || raw.userPhone || raw.phone || "";
  const avatar = userName.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase() || "??";

  // Map messages — backend sends sender: "USER" | "ADMIN" (uppercase), time: Date
  const rawMessages: any[] = raw.messages || raw.replies_list || [];
  const messages: Message[] = rawMessages.map((m: any) => {
    const sender = (m.sender || m.role || "").toUpperCase();
    const role: Message["role"] =
      sender === "ADMIN" || sender === "SUPPORT" ? "support" :
      sender === "ORIGINAL" ? "original" : "user";
    return {
      role,
      text: m.text || m.message || m.content || "",
      timestamp: m.time ? formatDate(m.time).date + " " + formatDate(m.time).time
        : m.timestamp || m.createdAt || "",
    };
  });

  // If no messages yet, show description as original message
  if (messages.length === 0) {
    const desc = raw.description || raw.subject || raw.message || raw.title || "";
    if (desc) {
      messages.push({
        role: "original",
        text: desc,
        timestamp: `${date} ${time}`,
      });
    }
  }

  return {
    id: raw._id || raw.id || String(Math.random()),
    user: { name: userName, phone: userPhone, avatar },
    category: mapCategory(raw.category || raw.type || "general"),
    subject: raw.title || raw.subject || raw.message || "No subject",
    priority: mapPriority(raw.priority || "medium"),
    status: mapStatus(raw.status || "pending"),
    replies: raw.repliesCount ?? raw.replies ?? messages.filter((m) => m.role === "support").length,
    date,
    time,
    lastMessage: raw.lastMessage || messages[messages.length - 1]?.text || "",
    messages,
  };
}

/* ── Style maps ── */
const priorityStyles: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
};

const statusColors: Record<string, string> = {
  Open: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  Closed: "bg-slate-400"
};

/* ── Page ── */
function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Real-time socket states & refs
  const [typingStatus, setTypingStatus] = useState("");
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("dsm_token");
    if (!token || !chatOpen || !selectedTicket) {
      setTypingStatus("");
      return;
    }

    const socketUrl = API_BASE.replace("/api/v1", "");
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Admin socket connected, joining ticket room:", selectedTicket.id);
      socket.emit("joinTicket", { ticketId: selectedTicket.id });
    });

    socket.on("chat:newMessage", (data: any) => {
      console.log("Admin socket received new message:", data);
      if (data.ticketId === selectedTicket.id) {
        const role = data.sender === "ADMIN" ? "support" : "user";
        const newMsg: Message = {
          role,
          text: data.text,
          timestamp: new Date(data.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        };

        setSelectedTicket(prev => {
          if (!prev || prev.id !== data.ticketId) return prev;
          // Avoid duplicate messages
          const exists = prev.messages.some(m => m.text === newMsg.text && m.role === newMsg.role);
          if (exists) return prev;
          return {
            ...prev,
            messages: [...prev.messages, newMsg]
          };
        });

        setTickets(prev => prev.map(tk => {
          if (tk.id !== data.ticketId) return tk;
          const exists = tk.messages.some(m => m.text === newMsg.text && m.role === newMsg.role);
          if (exists) return tk;
          return {
            ...tk,
            messages: [...tk.messages, newMsg],
            lastMessage: newMsg.text
          };
        }));
      }
    });

    socket.on("chat:typing", (data: any) => {
      if (data.senderName !== "Me" && data.senderName !== "Support Team") {
        setTypingStatus("Customer is typing...");
      }
    });

    socket.on("chat:stopTyping", () => {
      setTypingStatus("");
    });

    socket.on("statusUpdate", (data: any) => {
      if (data.ticketId === selectedTicket.id) {
        const mapped = data.newStatus === "completed" ? "Closed" : data.newStatus === "in_progress" ? "In Progress" : "Open";
        setSelectedTicket(prev => prev && prev.id === data.ticketId ? { ...prev, status: mapped } : prev);
        setTickets(prev => prev.map(tk => tk.id === data.ticketId ? { ...tk, status: mapped } : tk));
      }
    });

    return () => {
      console.log("Admin socket disconnecting for room:", selectedTicket.id);
      socket.emit("leaveTicket", { ticketId: selectedTicket.id });
      socket.disconnect();
    };
  }, [chatOpen, selectedTicket?.id]);

  const handleTyping = () => {
    if (!socketRef.current || !selectedTicket) return;
    socketRef.current.emit("chat:typing", {
      ticketId: selectedTicket.id,
      senderName: "Support Team"
    });
  };

  const handleStopTyping = () => {
    if (!socketRef.current || !selectedTicket) return;
    socketRef.current.emit("chat:stopTyping", {
      ticketId: selectedTicket.id
    });
  };

  /* ── Fetch tickets ── */
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/tickets?page=${page}&limit=10`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await apiFetch(url);
      const json = await res.json();
      if (json.success) {
        const rawTickets = json.data?.tickets ?? json.data ?? [];
        setTickets(rawTickets.map(mapApiTicket));
        if (json.data?.pagination) {
          setPagination(json.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  /* ── Computed stats ── */
  const totalCount = pagination.total;
  const openCount = tickets.filter(t => t.status === "Open").length;
  const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
  const closedCount = tickets.filter(t => t.status === "Closed").length;

  /* ── Open chat — fetch full ticket via GET /ticket/:id ── */
  const openChat = async (t: Ticket) => {
    setSelectedTicket(t);
    setChatOpen(true);
    try {
      const res = await apiFetch(`${API_BASE}/ticket/${t.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const full = mapApiTicket(json.data);
        setSelectedTicket(full);
        // Also update in list
        setTickets(prev => prev.map(tk => tk.id === full.id ? full : tk));
      }
    } catch {
      // Keep the already-set ticket, no crash
    }
  };

  const handleSendReply = async (ticketId: string, text: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("chat:sendMessage", {
        ticketId,
        text
      });
      socketRef.current.emit("chat:stopTyping", { ticketId });
      return;
    }

    try {
      const res = await apiFetch(`${API_BASE}/ticket/${ticketId}/message`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh ticket from API response
        const updated = json.data;
        if (updated) {
          const mapped = mapApiTicket(updated);
          setTickets(prev => prev.map(t => t.id === ticketId ? mapped : t));
          setSelectedTicket(prev => prev && prev.id === ticketId ? mapped : prev);
        } else {
          // Fallback optimistic update
          const now = new Date();
          const ts = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
          setTickets(prev => prev.map(t => t.id === ticketId ? {
            ...t,
            messages: [...t.messages, { role: "support" as const, text, timestamp: ts }],
            replies: t.replies + 1,
          } : t));
          setSelectedTicket(prev => prev && prev.id === ticketId ? {
            ...prev,
            messages: [...prev.messages, { role: "support" as const, text, timestamp: ts }],
            replies: prev.replies + 1,
          } : prev);
        }
        toast.success("Reply sent successfully");
      } else {
        toast.error(json.message || "Failed to send reply");
      }
    } catch {
      toast.error("Network error sending reply");
    }
  };

  const handleStatusChange = async (ticketId: string, status: "Open" | "Closed" | "In Progress") => {
    // Map display status to API status
    const apiStatus = status === "Closed" ? "completed" : status === "In Progress" ? "in_progress" : "pending";
    try {
      const res = await apiFetch(`${API_BASE}/ticket/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: apiStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
        setSelectedTicket(prev => prev && prev.id === ticketId ? { ...prev, status } : prev);
        toast.success(`Ticket marked as ${status}`);
      } else {
        toast.error(json.message || "Failed to update status");
      }
    } catch {
      toast.error("Network error updating status");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const res = await apiFetch(`${API_BASE}/ticket/${ticketId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) {
          setChatOpen(false);
          setSelectedTicket(null);
        }
        toast.success("Ticket deleted");
      } else {
        toast.error(json.message || "Failed to delete ticket");
      }
    } catch {
      toast.error("Network error deleting ticket");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Chat Support"
        subtitle="Manage customer queries, callback requests, and technical support tickets."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchTickets}>
              <Filter className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Export Report
            </Button>
          </div>
        }
      />

      <div className="grid gap-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Tickets" value={String(totalCount)} sub="All time" icon={<MessageSquare className="text-blue-500" />} />
          <StatCard title="Open Tickets" value={String(openCount)} sub="Requires attention" icon={<AlertCircle className="text-rose-500" />} color="rose" />
          <StatCard title="In Progress" value={String(inProgressCount)} sub="Team is working" icon={<Clock className="text-amber-500" />} color="amber" />
          <StatCard title="Resolved" value={String(closedCount)} sub="Successfully closed" icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
        </div>

        {/* Tickets List Card */}
        <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <div className="p-4 border-b bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center bg-muted/50 rounded-lg p-1 w-fit">
              <TabButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="All Tickets" count={totalCount} />
              <TabButton active={statusFilter === "open"} onClick={() => setStatusFilter("open")} label="Active" count={openCount} />
              <TabButton active={statusFilter === "closed"} onClick={() => setStatusFilter("closed")} label="Resolved" count={closedCount} />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user or subject..."
                  className="pl-9 w-full md:w-[280px] h-9 bg-background border-muted-foreground/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[140px] h-9 bg-background border-muted-foreground/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground italic">Loading tickets…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold uppercase text-muted-foreground border-b bg-muted/20">
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Inquiry Details</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Activity</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {tickets.map((t) => (
                    <tr key={t.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">
                            {t.user.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{t.user.name}</div>
                            <div className="text-[11px] text-muted-foreground font-medium">{t.user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[300px]">
                        <div className="font-semibold text-sm truncate">{t.subject}</div>
                        <div className="text-[11px] text-muted-foreground truncate italic mt-0.5 opacity-80">
                          "{t.lastMessage}"
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-[10px] w-fit font-bold border-muted-foreground/20">
                            {t.category.label}
                          </Badge>
                          {t.category.type === "CALLBACK" && (
                            <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-md px-1.5 py-0.5 w-fit uppercase tracking-tighter">
                              <Phone className="h-2.5 w-2.5 fill-emerald-600" /> Req. Callback
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`text-[10px] font-bold rounded-full px-3 py-0.5 ${priorityStyles[t.priority] || priorityStyles.MEDIUM}`}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${statusColors[t.status] || statusColors.Open}`} />
                          <span className="text-xs font-bold text-foreground/80">{t.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-[12px] font-bold text-foreground/70">{t.date}</div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                              <MessageSquare className="h-3 w-3" /> {t.replies}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium">{t.time}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => openChat(t)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-xs font-bold"
                                onClick={() => handleStatusChange(t.id, "Closed")}
                              >
                                Mark as Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-bold text-rose-500"
                                onClick={() => handleDeleteTicket(t.id)}
                              >
                                Delete Ticket
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tickets.length === 0 && (
                <div className="py-20 text-center">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg">No tickets found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your filters or search query.</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-xs text-muted-foreground font-medium">
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} total tickets
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <TicketChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        ticket={selectedTicket}
        onSendReply={handleSendReply}
        onStatusChange={handleStatusChange}
        typingStatus={typingStatus}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ title, value, sub, icon, color = "blue" }: { title: string, value: string, sub: string, icon: React.ReactNode, color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10",
    rose: "bg-rose-500/10",
    amber: "bg-amber-500/10",
    emerald: "bg-emerald-500/10"
  };

  return (
    <Card className="p-4 border-none shadow-sm bg-card/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{title}</p>
          <h3 className="text-2xl font-black mt-1">{value}</h3>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium italic opacity-70">{sub}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* ── Tab Button ── */
function TabButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${active
          ? "bg-background text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {count}
      </span>
    </button>
  );
}
