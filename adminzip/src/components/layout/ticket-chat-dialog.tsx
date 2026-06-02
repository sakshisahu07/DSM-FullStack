import { useState, useRef, useEffect } from "react";
import { 
  Dialog, DialogContent
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Send, Phone, AlertCircle, Clock, MessageSquare
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

interface Message {
  role: "original" | "user" | "support";
  text: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  user: { name: string; phone: string; avatar?: string };
  category: { label: string; type: string };
  priority: string;
  status: string;
  subject: string;
  messages: Message[];
}

export function TicketChatDialog({ 
  open, 
  onOpenChange, 
  ticket,
  onSendReply,
  onStatusChange,
  typingStatus,
  onTyping,
  onStopTyping
}: { 
  open: boolean, 
  onOpenChange: (v: boolean) => void,
  ticket: Ticket | null,
  onSendReply: (ticketId: string, text: string) => void | Promise<void>,
  onStatusChange: (ticketId: string, status: "Open" | "Closed" | "In Progress") => void | Promise<void>,
  typingStatus?: string,
  onTyping?: () => void,
  onStopTyping?: () => void
}) {
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [ticket?.messages, typingStatus, open]);

  if (!ticket) return null;

  const handleSend = async () => {
    if (!reply.trim()) return;
    setIsSending(true);
    try {
      await onSendReply(ticket.id, reply.trim());
      setReply("");
      if (onStopTyping) onStopTyping();
    } finally {
      setIsSending(false);
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p.toUpperCase()) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case "closed":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "in progress":
        return "bg-primary/15 text-primary border-primary/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const handleTextareaChange = (val: string) => {
    setReply(val);
    if (onTyping) onTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping();
    }, 2000);
  };

  const initials = ticket.user.name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[850px] w-full h-[650px] flex flex-col p-0 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300">
        
        {/* Header Section */}
        <div className="p-6 border-b border-border bg-card/40 backdrop-blur flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Ticket Subject and Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-foreground leading-tight">{ticket.subject}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                  {ticket.category.label}
                </Badge>
                <Badge variant="outline" className={`${getPriorityStyle(ticket.priority)} font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase`}>
                  {ticket.priority} Priority
                </Badge>
                <Badge variant="outline" className={`${getStatusStyle(ticket.status)} font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase`}>
                  {ticket.status}
                </Badge>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 border border-border/40 min-w-[240px]">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {ticket.user.avatar || initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate">{ticket.user.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-muted-foreground/75" /> {ticket.user.phone || "No phone"}
                </div>
              </div>
              {ticket.user.phone && (
                <a 
                  href={`tel:${ticket.user.phone}`} 
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 transition-all"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 fill-emerald-500/10" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/10 scrollbar-thin">
          
          {ticket.messages.map((m, i) => {
            const isOriginal = m.role === "original";
            const isSupport = m.role === "support";

            if (isOriginal) {
              return (
                <div 
                  key={i} 
                  className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm border-l-4 border-l-primary relative overflow-hidden transition-all duration-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-primary" /> Ticket Description
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {m.timestamp}
                    </span>
                  </div>
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap font-medium leading-relaxed">{m.text}</div>
                </div>
              );
            }

            return (
              <div 
                key={i} 
                className={`flex ${isSupport ? "justify-end" : "justify-start"} items-start gap-2.5`}
              >
                {!isSupport && (
                  <div className="h-7 w-7 rounded-full bg-muted/60 text-muted-foreground border border-border flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm mt-0.5">
                    {initials}
                  </div>
                )}

                <div className={`flex flex-col max-w-[70%] ${isSupport ? "items-end" : "items-start"}`}>
                  <div 
                    className={`rounded-2xl px-4 py-3 shadow-sm text-sm font-medium leading-relaxed ${
                      isSupport 
                        ? "bg-gradient-to-br from-primary to-orange-500 text-white rounded-tr-none shadow-primary/10" 
                        : "bg-card border border-border/80 text-foreground rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                  
                  <span className="text-[9px] text-muted-foreground font-bold tracking-tight mt-1 px-1 flex items-center gap-1">
                    {isSupport ? "Support Agent" : ticket.user.name} · {m.timestamp}
                  </span>
                </div>

                {isSupport && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm mt-0.5">
                    AD
                  </div>
                )}
              </div>
            );
          })}

          {typingStatus && (
            <div className="flex justify-start items-center gap-2.5 pl-9 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/20">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
              <span className="text-xs text-teal-500 italic font-bold tracking-tight">{typingStatus}</span>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>

        {/* Footer / Input Area */}
        <div className="p-5 border-t border-border bg-card/30 backdrop-blur">
          
          <div className="relative mb-4">
            <Textarea 
              placeholder={`Write a reply to ${ticket.user.name}...`} 
              className="min-h-[85px] w-full resize-none border-border/80 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/60 transition-all duration-200"
              value={reply}
              onChange={(e) => handleTextareaChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            {reply.trim() && (
              <span className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground/70 font-semibold bg-muted px-2 py-0.5 rounded-md">
                Press Enter to send
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-bold hidden sm:inline">Status:</span>
              <Select 
                value={ticket.status.toLowerCase()} 
                onValueChange={(val) => {
                  const mapped = val === "closed" ? "Closed" : val === "in progress" ? "In Progress" : "Open";
                  onStatusChange(ticket.id, mapped);
                }}
              >
                <SelectTrigger className="w-[145px] h-9 text-xs rounded-lg border-border/80 bg-background/40 hover:bg-background/80 transition-all">
                  <SelectValue placeholder="Change status…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)} 
                className="font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 uppercase text-[11px] rounded-lg h-9 px-4 tracking-wider transition-all"
              >
                CLOSE
              </Button>
              <Button 
                disabled={!reply.trim() || isSending} 
                onClick={handleSend}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-9 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:shadow-none rounded-lg text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> SEND REPLY
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
