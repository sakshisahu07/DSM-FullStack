import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Phone, Search } from "lucide-react";
import { TicketChatDialog } from "./ticket-chat-dialog";

interface Message {
  role: "original" | "user" | "support";
  text: string;
  timestamp: string;
}


interface Ticket {
  id: string;
  user: { name: string; phone: string };
  category: { label: string; type: "GENERAL" | "CALLBACK" | "TRANSACTION" };
  subject: string;
   priority: "LOW" | "MEDIUM" | "HIGH";
   status: "Open" | "Closed" | "In Progress";
   replies: number;
   date: string;
   time: string;
   messages: Message[];
 }


const mockTickets: Ticket[] = [
  {
    id: "1",
    user: { name: "Prince", phone: "6205872519" },
    category: { label: "GENERAL", type: "GENERAL" },
    subject: "hii",
    priority: "MEDIUM",
    status: "Open",
     replies: 2,
     date: "8/5/2026",
     time: "10:40",
     messages: [
       { role: "original", text: "hii", timestamp: "8/5/2026 10:40" },
       { role: "user", text: "hii", timestamp: "8/5/2026 10:40" },
       { role: "support", text: "hii", timestamp: "9/5/2026 11:53" }
     ]
   },

  {
    id: "2",
    user: { name: "Prince", phone: "6205872519" },
    category: { label: "GENERAL", type: "GENERAL" },
    subject: "Hello",
    priority: "MEDIUM",
    status: "Closed",
     replies: 2,
     date: "8/5/2026",
     time: "8:16",
     messages: [
       { role: "original", text: "Hello", timestamp: "8/5/2026 8:16" }
     ]
   },

  {
    id: "3",
    user: { name: "Prince", phone: "6205872519" },
    category: { label: "CALLBACK", type: "CALLBACK" },
    subject: "Finally Prince",
    priority: "MEDIUM",
    status: "Open",
     replies: 5,
     date: "7/5/2026",
     time: "13:25",
     messages: [
       { role: "original", text: "Finally Prince", timestamp: "7/5/2026 13:25" }
     ]
   },

  {
    id: "4",
    user: { name: "Prince", phone: "6205872519" },
    category: { label: "CALLBACK", type: "CALLBACK" },
    subject: "Test prince",
    priority: "MEDIUM",
    status: "Open",
     replies: 4,
     date: "7/5/2026",
     time: "12:33",
     messages: [
       { role: "original", text: "Test prince", timestamp: "7/5/2026 12:33" }
     ]
   },

  {
    id: "5",
    user: { name: "Prince", phone: "6205872519" },
    category: { label: "TRANSACTION", type: "TRANSACTION" },
    subject: "test",
    priority: "HIGH",
    status: "In Progress",
     replies: 3,
     date: "7/5/2026",
     time: "12:22",
     messages: [
       { role: "original", text: "test", timestamp: "7/5/2026 12:22" }
     ]
   }
];


const priorityStyles = {
  LOW: "bg-blue-500 text-white",
  MEDIUM: "bg-amber-500 text-white",
  HIGH: "bg-rose-500 text-white"
};

const categoryStyles = {
  GENERAL: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  CALLBACK: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  TRANSACTION: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
};

 export function SupportTicketsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
   const [tickets, setTickets] = useState(mockTickets);
   const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
   const [showChat, setShowChat] = useState(false);
 
   const handleView = (t: Ticket) => {
     setSelectedTicket(t);
     setShowChat(true);
   };

   const handleSendReply = (ticketId: string, text: string) => {
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
   };

   const handleStatusChange = (ticketId: string, status: "Open" | "Closed" | "In Progress") => {
     setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
     setSelectedTicket(prev => prev && prev.id === ticketId ? { ...prev, status } : prev);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
          <DialogTitle className="text-xl font-bold text-slate-700">WhatsApp Support Tickets</DialogTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-[200px] h-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="callback">Callback</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold uppercase text-slate-500 border-b bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Replies</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map((t) => (
                <tr key={t.id} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-700 dark:text-slate-200">{t.user.name}</div>
                    <div className="text-xs text-muted-foreground">{t.user.phone}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      <Badge variant="secondary" className={`text-[10px] w-fit font-bold ${categoryStyles[t.category.type]}`}>
                        {t.category.label}
                      </Badge>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-full px-2 py-0.5 w-fit">
                        <Phone className="h-3 w-3" /> Callback
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-600 dark:text-slate-400">
                    {t.subject}
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={`text-[10px] font-bold rounded-full px-3 ${priorityStyles[t.priority]}`}>
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Select defaultValue={t.status}>
                      <SelectTrigger className="h-8 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-indigo-200 text-indigo-500 font-bold text-xs">
                      {t.replies}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[12px] font-medium">{t.date}</div>
                    <div className="text-[11px] text-muted-foreground">{t.time}</div>
                  </td>
                   <td className="px-4 py-4 text-right">
                     <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => handleView(t)}>
                       <Eye className="h-4 w-4" />
                     </Button>
                   </td>

                </tr>
              ))}
           </tbody>
           </table>
         </div>
 
         <TicketChatDialog 
           open={showChat} 
           onOpenChange={setShowChat} 
           ticket={selectedTicket}
           onSendReply={handleSendReply}
           onStatusChange={handleStatusChange}
         />
       </DialogContent>
     </Dialog>

  );
}
