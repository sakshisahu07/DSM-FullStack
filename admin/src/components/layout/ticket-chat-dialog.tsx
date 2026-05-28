import { useState } from "react";
import { 
  Dialog, DialogContent
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  user: { name: string; phone: string };
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
  onStatusChange
}: { 
  open: boolean, 
  onOpenChange: (v: boolean) => void,
  ticket: Ticket | null,
  onSendReply: (ticketId: string, text: string) => void,
  onStatusChange: (ticketId: string, status: "Open" | "Closed" | "In Progress") => void
}) {
  const [reply, setReply] = useState("");

  if (!ticket) return null;

  const handleSend = () => {
    if (!reply.trim()) return;
    onSendReply(ticket.id, reply.trim());
    setReply("");
  };

  const getPriorityStyle = (p: string) => {
    switch (p.toUpperCase()) {
      case "HIGH":
        return "bg-rose-100 text-rose-600 border-rose-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-600 border-amber-200";
      default:
        return "bg-blue-100 text-blue-600 border-blue-200";
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case "closed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "in progress":
        return "bg-amber-100 text-amber-600 border-amber-200";
      default:
        return "bg-sky-100 text-sky-600 border-sky-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[800px] h-[600px] flex flex-col p-0 overflow-hidden rounded-xl border border-border bg-background">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">{ticket.subject}</h2>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-bold px-3 py-0.5 rounded-full text-[10px]">
                  {ticket.category.label}
                </Badge>
                <Badge variant="outline" className={`${getPriorityStyle(ticket.priority)} font-bold px-3 py-0.5 rounded-full text-[10px]`}>
                  {ticket.priority}
                </Badge>
                <Badge variant="outline" className={`${getStatusStyle(ticket.status)} font-bold px-3 py-0.5 rounded-full text-[10px] uppercase`}>
                  {ticket.status}
                </Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-muted-foreground">
                {ticket.user.name} ({ticket.user.phone})
              </div>
              <div className="text-sm font-bold text-success mt-1">
                Callback: {ticket.user.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
          {ticket.messages.map((m, i) => {
            const isOriginal = m.role === "original";
            const isSupport = m.role === "support";

            return (
              <div 
                key={i} 
                className={`rounded-xl border p-4 shadow-sm relative overflow-hidden transition-all ${
                  isOriginal ? "bg-blue-50/40 border-blue-200 border-l-4 border-l-blue-500" :
                  isSupport ? "bg-success/5 border-success/20 border-l-4 border-l-success" :
                  "bg-card border-border border-l-4 border-l-muted-foreground"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                    isOriginal ? "text-blue-600" :
                    isSupport ? "text-success" :
                    "text-muted-foreground"
                  }`}>
                    {isOriginal ? "Original Message" : isSupport ? "Support Team" : "User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">{m.timestamp}</span>
                </div>
                <div className="text-sm text-foreground/90 whitespace-pre-wrap font-medium">{m.text}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-card">
          <Textarea 
            placeholder="Reply to user" 
            className="min-h-[90px] mb-4 resize-none focus-visible:ring-1 border-muted-foreground/20 rounded-xl"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <Select 
              value={ticket.status.toLowerCase()} 
              onValueChange={(val) => {
                const mapped = val === "closed" ? "Closed" : val === "in progress" ? "In Progress" : "Open";
                onStatusChange(ticket.id, mapped);
              }}
            >
              <SelectTrigger className="w-[160px] h-9 text-muted-foreground rounded-lg border-muted-foreground/25">
                <SelectValue placeholder="Change status…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)} 
                className="font-bold text-primary hover:text-primary/95 hover:bg-primary/5 uppercase text-xs"
              >
                CLOSE
              </Button>
              <Button 
                disabled={!reply.trim()} 
                onClick={handleSend}
                className="bg-primary text-primary-foreground font-bold px-8 hover:bg-primary/90 disabled:opacity-50 rounded-lg text-xs"
              >
                SEND REPLY
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
