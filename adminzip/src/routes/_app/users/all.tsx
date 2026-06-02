import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Bell, ImagePlus, X } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { DashboardFilters } from "@/components/dashboard-filters";
import { inrFormat, type UserAccount } from "@/lib/mock-data";


export const Route = createFileRoute("/_app/users/all")({
  component: UsersAllPage,
});

const roleTone = {
  Admin: "bg-destructive/15 text-destructive",
  Manager: "bg-info/15 text-info",
  Support: "bg-success/15 text-success",
  User: "bg-muted text-muted-foreground",
};

const fields: FormField[] = [
  { name: "name", label: "Full name", required: true, span: 6 },
  { name: "phone", label: "Phone", required: true, span: 6 },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "role", label: "Role", type: "select", required: true, span: 6,
    options: [
      { label: "User", value: "User" },
      { label: "Support", value: "Support" },
      { label: "Manager", value: "Manager" },
      { label: "Admin", value: "Admin" },
    ],
  },
  { name: "wallet", label: "Wallet (₹)", type: "number", span: 6 },
  { name: "active", label: "Active", type: "switch" },
];

function UsersAllPage() {
  const [items, setItems] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);

  // Notification modal state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifUser, setNotifUser] = useState<UserAccount | null>(null);
  const [notifImage, setNotifImage] = useState<File | null>(null);
  const [notifImagePreview, setNotifImagePreview] = useState<string | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifMessage, setNotifMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch("/auth/users");
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data)) {
          const mappedUsers = data.data.map((u: any): UserAccount => {
            let userRole: UserAccount["role"] = "User";
            if (typeof u.role === 'string') {
              const r = u.role.toUpperCase();
              if (r === 'ADMIN' || u.role.length === 24) userRole = "Admin";
            }
            
            return {
              id: u._id,
              name: u.name || (u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : "Unknown"),
              phone: u.number || "-",
              email: u.email || "",
              joinDate: u.createdAt || new Date().toISOString(),
              orders: 0,
              spent: u.totalInvestment || 0,
              wallet: u.wallet || u.walletBalance || 0,
              role: userRole,
              active: !u.disable
            };
          });
          setItems(mappedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (u: UserAccount) => { setEditing(u); setOpen(true); };
  const onDelete = (u: UserAccount) => {
    setItems((p) => p.filter((x) => x.id !== u.id));
    toast.success(`Removed ${u.name}`);
  };
  const toggle = (id: string) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, active: !x.active } : x));
    toast.success("Status updated");
  };

  const onNotify = (u: UserAccount) => {
    setNotifUser(u);
    setNotifImage(null);
    setNotifImagePreview(null);
    setNotifTitle("");
    setNotifMessage("");
    setNotifOpen(true);
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setNotifImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setNotifImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setNotifImage(null);
    setNotifImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!notifMessage.trim()) {
      toast.error("Message is required");
      return;
    }
    toast.success(`Notification sent to ${notifUser?.name}`);
    setNotifOpen(false);
  };

  const cols: Column<UserAccount>[] = [
    { key: "name", header: "Customer", cell: (u) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold">
          {u.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="font-medium">{u.name}</div>
          <div className="text-xs text-muted-foreground">{u.email}</div>
        </div>
      </div>
    ) },
    { key: "phone", header: "Phone", cell: (u) => <span className="font-mono text-sm">+91 {u.phone}</span> },
    { key: "role", header: "Role", cell: (u) => <Badge variant="outline" className={roleTone[u.role]}>{u.role}</Badge> },
    { key: "orders", header: "Orders", cell: (u) => u.orders },
    { key: "spent", header: "Lifetime", cell: (u) => inrFormat(u.spent) },
    { key: "wallet", header: "Wallet", cell: (u) => inrFormat(u.wallet) },
    { key: "active", header: "Active", cell: (u) => <Switch checked={u.active} onCheckedChange={() => toggle(u.id)} /> },
    {
      key: "actions", header: "", className: "text-right",
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(u)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500 hover:text-amber-600" onClick={() => onNotify(u)}><Bell className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(u)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Users"
        subtitle="Customers, support staff, managers and admins."
         actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Invite user</Button>}
       />
       <DashboardFilters />
       <DataTable storageKey="users.all" data={items} columns={cols} searchKeys={["name", "email", "phone"]} loading={loading} />


      <FormDialog<UserAccount>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit user" : "Invite user"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ role: "User", active: true, wallet: 0 }}
        onSubmit={(v) => {
          if (editing) {
            setItems((p) => p.map((x) => x.id === editing.id ? { ...editing, ...v } : x));
            toast.success("User updated");
          } else {
            setItems((p) => [{
              ...v,
              id: `USR-${2000 + p.length + 1}`,
              joinDate: new Date().toISOString(),
              orders: 0, spent: 0,
            }, ...p]);
            toast.success("User created");
          }
          setOpen(false);
        }}
      />

      {/* Notification Modal */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a push notification to <strong>{notifUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image upload field */}
            <div className="space-y-1.5">
              <Label>Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
              />
              {notifImagePreview ? (
                <div className="relative rounded-lg border overflow-hidden group">
                  <img
                    src={notifImagePreview}
                    alt="Notification preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-white text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">Change image</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer py-8 px-4"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground mt-0.5">or drag and drop</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title field */}
            <div className="space-y-1.5">
              <Label htmlFor="notif-title">Title *</Label>
              <Input
                id="notif-title"
                type="text"
                placeholder="Notification title"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
              />
            </div>

            {/* Message field */}
            <div className="space-y-1.5">
              <Label htmlFor="notif-message">Message *</Label>
              <Textarea
                id="notif-message"
                rows={4}
                placeholder="Write your notification message…"
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifOpen(false)}>Cancel</Button>
            <Button
              disabled={!notifTitle.trim() || !notifMessage.trim()}
              onClick={handleSendNotification}
            >
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

