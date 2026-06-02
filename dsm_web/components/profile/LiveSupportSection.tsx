"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { io } from "socket.io-client";
import { BASE_URL } from "@/redux/slices/apiConfig";
import {
  fetchMyTickets,
  fetchTicketById,
  createTicket,
  addMessage,
  deleteTicket,
  clearSelectedTicket,
  Ticket,
  appendMessageOptimistic,
} from "@/redux/slices/ticketSlice";
import {
  MessageCircle,
  Plus,
  ArrowLeft,
  Send,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Headphones,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── helpers ─────────────────────────────── */

function statusMeta(status: string) {
  switch (status) {
    case "completed":
      return {
        label: "Resolved",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        icon: <CheckCircle2 size={11} />,
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        icon: <Clock size={11} />,
      };
    default:
      return {
        label: "Pending",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        icon: <AlertCircle size={11} />,
      };
  }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ─── sub-components ──────────────────────── */

function NewTicketForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { actionLoading, error } = useSelector(
    (s: RootState) => s.tickets
  );
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    const result = await dispatch(createTicket(form));
    if (createTicket.fulfilled.match(result)) {
      toast.success("Ticket raised successfully!");
      onSuccess();
    } else {
      toast.error((result.payload as string) || "Failed to create ticket");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#EE9C24] to-[#f5b53f] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Headphones size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                Raise a Support Ticket
              </h3>
              <p className="text-white/80 text-xs mt-0.5">
                Our team will respond within 24 hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/40 focus:border-[#EE9C24] transition"
            >
              <option value="general">General Inquiry</option>
              <option value="callback">Request Callback</option>
              <option value="transaction">Transaction Issue</option>
              <option value="technical">Technical Problem</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Subject *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Brief title of your issue"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/40 focus:border-[#EE9C24] transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Description *
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe your issue in detail..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/40 focus:border-[#EE9C24] transition"
              required
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-medium bg-rose-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#EE9C24] to-[#f5b53f] rounded-xl text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Ticket Detail / Chat ─────────────────── */

function TicketDetail({
  ticket,
  onBack,
  onDeleted,
}: {
  ticket: Ticket;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { actionLoading, selectedTicket } = useSelector(
    (s: RootState) => s.tickets
  );
  const { token } = useSelector((s: RootState) => s.auth);
  const [text, setText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use live selectedTicket if it matches (for real-time message updates)
  const live = selectedTicket?._id === ticket._id ? selectedTicket : ticket;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [live.messages, typingStatus]);

  useEffect(() => {
    if (!token) return;

    // Resolve socket URL from BASE_URL
    const socketUrl = BASE_URL.replace("/api/v1", "");
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected, joining ticket:", ticket._id);
      socket.emit("joinTicket", { ticketId: ticket._id });
    });

    socket.on("chat:chatHistory", (data: any) => {
      console.log("Socket chat history:", data);
    });

    socket.on("chat:newMessage", (data: any) => {
      console.log("Socket received new message:", data);
      if (data.ticketId === ticket._id) {
        dispatch(
          appendMessageOptimistic({
            ticketId: ticket._id,
            message: {
              sender: data.sender,
              text: data.text,
              time: data.time || new Date().toISOString(),
            },
          })
        );
      }
    });

    socket.on("chat:typing", (data: any) => {
      if (data.senderName !== "Me" && data.senderName !== "User") {
        setTypingStatus("Support is typing...");
      }
    });

    socket.on("chat:stopTyping", () => {
      setTypingStatus("");
    });

    socket.on("statusUpdate", (data: any) => {
      if (data.ticketId === ticket._id) {
        dispatch(fetchTicketById(ticket._id));
      }
    });

    return () => {
      console.log("Disconnecting socket for ticket:", ticket._id);
      socket.emit("leaveTicket", { ticketId: ticket._id });
      socket.disconnect();
    };
  }, [ticket._id, token, dispatch]);

  const handleTextChange = (val: string) => {
    setText(val);
    if (!socketRef.current) return;

    socketRef.current.emit("chat:typing", {
      ticketId: ticket._id,
      senderName: "User",
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("chat:stopTyping", { ticketId: ticket._id });
    }, 2000);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("chat:sendMessage", {
        ticketId: ticket._id,
        text: text.trim(),
      });
      setText("");
      socketRef.current.emit("chat:stopTyping", { ticketId: ticket._id });
    } else {
      // Fallback to HTTP POST
      const result = await dispatch(
        addMessage({ ticketId: ticket._id, text: text.trim() })
      );
      if (addMessage.fulfilled.match(result)) {
        setText("");
      } else {
        toast.error("Failed to send message");
      }
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteTicket(ticket._id));
    if (deleteTicket.fulfilled.match(result)) {
      toast.success("Ticket deleted");
      onDeleted();
    } else {
      toast.error("Failed to delete ticket");
    }
  };

  const st = statusMeta(live.status);

  return (
    <div className="flex flex-col h-full min-h-[520px] max-h-[680px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-1">
              {live.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 border text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${st.color}`}
              >
                {st.icon} {st.label}
              </span>
              <span className="text-[10px] text-gray-400 capitalize bg-gray-100 rounded-full px-2 py-0.5">
                {live.category}
              </span>
              <span className="text-[10px] text-gray-400">
                {fmtDate(live.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {live.status !== "completed" && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-gray-400 hover:text-rose-500 transition p-2 rounded-xl hover:bg-rose-50"
            title="Delete ticket"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 my-3 flex items-center justify-between gap-3">
          <p className="text-xs text-rose-700 font-medium">
            Are you sure you want to delete this ticket?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 font-semibold hover:bg-rose-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition disabled:opacity-60 flex items-center gap-1"
            >
              {actionLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : null}
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      {live.description && (
        <div className="my-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">
            Issue Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{live.description}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
        {live.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageCircle size={32} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Our support team will reply here
            </p>
          </div>
        )}
        {live.messages.map((msg, i) => {
          const isAdmin = msg.sender === "ADMIN";
          return (
            <div
              key={i}
              className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
            >
              {isAdmin && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EE9C24] to-[#f5b53f] flex items-center justify-center mr-2 shrink-0 mt-1 shadow-sm">
                  <Headphones size={13} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  isAdmin
                    ? "bg-white border border-gray-100 rounded-tl-sm"
                    : "bg-gradient-to-br from-[#EE9C24] to-[#f5b53f] text-white rounded-tr-sm"
                }`}
              >
                <p
                  className={`text-sm leading-relaxed ${
                    isAdmin ? "text-gray-800" : "text-white"
                  }`}
                >
                  {msg.text}
                </p>
                <p
                  className={`text-[9px] mt-1 ${
                    isAdmin ? "text-gray-400" : "text-white/70"
                  }`}
                >
                  {isAdmin ? "Support Team · " : "You · "}
                  {fmtDate(msg.time)}
                </p>
              </div>
            </div>
          );
        })}
        {typingStatus && (
          <div className="flex justify-start items-center gap-2 pl-2 mt-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EE9C24] to-[#f5b53f] flex items-center justify-center mr-2 shrink-0 shadow-sm animate-pulse">
              <Headphones size={13} className="text-white" />
            </div>
            <p className="text-xs text-gray-400 italic font-semibold animate-pulse">
              {typingStatus}
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {live.status !== "completed" ? (
        <div className="pt-3 border-t border-gray-100 mt-2">
          <div className="flex gap-2 items-end">
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Type your message... (Enter to send)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/40 focus:border-[#EE9C24] transition"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || actionLoading}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#EE9C24] to-[#f5b53f] text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 shadow-sm shrink-0"
            >
              {actionLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-gray-100 mt-2 text-center">
          <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 rounded-xl py-2.5 px-4">
            ✓ This ticket has been resolved. Thank you for contacting us!
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Ticket List Item ─────────────────────── */

function TicketListItem({
  ticket,
  onClick,
}: {
  ticket: Ticket;
  onClick: () => void;
}) {
  const st = statusMeta(ticket.status);
  const lastMsg = ticket.messages[ticket.messages.length - 1];

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#EE9C24]/30 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm line-clamp-1">
              {ticket.title}
            </span>
            <span
              className={`inline-flex items-center gap-1 border text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}
            >
              {st.icon} {st.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {lastMsg
              ? (lastMsg.sender === "ADMIN" ? "Support: " : "You: ") +
                lastMsg.text
              : ticket.description}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[10px] text-gray-400 capitalize bg-gray-100 rounded-full px-2 py-0.5">
              {ticket.category}
            </span>
            <span className="text-[10px] text-gray-400">
              {fmtDate(ticket.createdAt)}
            </span>
            {ticket.messages.length > 0 && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <MessageCircle size={9} /> {ticket.messages.length} message
                {ticket.messages.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-gray-300 group-hover:text-[#EE9C24] transition-colors mt-1 shrink-0"
        />
      </div>
    </button>
  );
}

/* ─── Main Component ──────────────────────── */

export default function LiveSupportSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, loading, selectedTicket, error } = useSelector(
    (s: RootState) => s.tickets
  );
  const { token } = useSelector((s: RootState) => s.auth);

  const [view, setView] = useState<"list" | "detail">("list");
  const [showNewForm, setShowNewForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const loadTickets = useCallback(() => {
    if (token) dispatch(fetchMyTickets({}));
  }, [dispatch, token]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openTicket = async (ticket: Ticket) => {
    setActiveTicket(ticket);
    setView("detail");
    await dispatch(fetchTicketById(ticket._id));
  };

  const goBack = () => {
    setView("list");
    setActiveTicket(null);
    dispatch(clearSelectedTicket());
  };

  if (!token) {
    return (
      <div
        id="live-support"
        className="rounded-[28px] bg-[#f8f7f5] p-6 md:p-8"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Headphones size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-600 font-semibold">
            Please log in to access Live Support
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showNewForm && (
        <NewTicketForm
          onClose={() => setShowNewForm(false)}
          onSuccess={() => {
            setShowNewForm(false);
            loadTickets();
          }}
        />
      )}

      <div
        id="live-support"
        className="rounded-[28px] bg-[#f8f7f5] p-4 sm:p-6 md:p-8"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {view === "detail" && (
              <button
                onClick={goBack}
                className="p-2 rounded-xl hover:bg-white transition text-gray-500 -ml-2 lg:hidden"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 inline-block border-b-4 border-[#EE9C24] pb-1 leading-tight">
                Live Support
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {view === "detail"
                  ? "Ticket Conversation"
                  : "Manage your support tickets"}
              </p>
            </div>
          </div>

          {view === "list" && (
            <div className="flex items-center gap-2">
              <button
                onClick={loadTickets}
                disabled={loading}
                className="p-2 rounded-xl hover:bg-white transition text-gray-500 border border-gray-200 bg-white/60"
                title="Refresh"
              >
                <RefreshCcw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EE9C24] to-[#f5b53f] text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Ticket</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          )}
        </div>

        {/* Detail View */}
        {view === "detail" && activeTicket && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <TicketDetail
              ticket={selectedTicket?._id === activeTicket._id ? selectedTicket! : activeTicket}
              onBack={goBack}
              onDeleted={() => {
                goBack();
                loadTickets();
              }}
            />
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <>
            {loading && tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-[#EE9C24]" />
                <p className="text-sm text-gray-400">Loading your tickets…</p>
              </div>
            ) : error && tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <AlertCircle size={32} className="text-rose-300" />
                <p className="text-sm text-gray-500">{error}</p>
                <button
                  onClick={loadTickets}
                  className="text-xs text-[#EE9C24] font-semibold hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#EE9C24]/10 flex items-center justify-center">
                  <Headphones size={28} className="text-[#EE9C24]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    No support tickets yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs">
                    Having an issue? Raise a ticket and our team will get back
                    to you.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#EE9C24] to-[#f5b53f] text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-sm"
                >
                  <Plus size={16} /> Raise Your First Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <TicketListItem
                    key={t._id}
                    ticket={t}
                    onClick={() => openTicket(t)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
