import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Image as ImageIcon, GripVertical, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";

export const Route = createFileRoute("/_app/marketing/banners")({
  component: BannersPage,
});

interface Banner {
  _id: string;
  title: string;
  image: string;
  redirectUrl?: string;
  page: string;
  position: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function BannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);

  /* ── Fetch Banners ── */
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/banners/all?page=1&limit=100`, { 
        headers: getAuthHeaders() 
      });
      const json = await res.json();
      if (json.success) {
        // Support both backend structures ({ banners: [...] } vs direct array)
        const bannerList = json.data?.banners || (Array.isArray(json.data) ? json.data : []);
        setItems(bannerList);
      } else {
        toast.error(json.message || "Failed to load banners");
      }
    } catch (err: any) {
      toast.error(err.message || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  /* ── Form Actions ── */
  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (b: Banner) => { setEditing(b); setOpen(true); };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`${API_BASE}/banners/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Banner deleted successfully");
        setItems((p) => p.filter((x) => x._id !== id));
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting banner");
    }
  };

  const toggle = async (id: string, currentStatus: boolean) => {
    try {
      const target = items.find((x) => x._id === id);
      if (!target) return;

      const formData = new FormData();
      formData.append("title", target.title);
      formData.append("page", target.page);
      formData.append("position", String(target.position));
      formData.append("redirectUrl", target.redirectUrl || "");
      formData.append("isActive", String(!currentStatus));

      const res = await fetch(`${API_BASE}/banners/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setItems((p) => p.map((x) => x._id === id ? { ...x, isActive: !currentStatus } : x));
        toast.success("Status updated");
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating status");
    }
  };

  const onSave = async (v: any) => {
    try {
      const formData = new FormData();
      formData.append("title", v.title);
      formData.append("page", v.page);
      formData.append("position", String(v.position));
      formData.append("redirectUrl", v.redirectUrl || "");
      formData.append("isActive", String(!!v.isActive));
      
      // Pass dates if editing or supply defaults to pass strict validations
      formData.append("startDate", editing?.startDate || v.startDate || new Date().toISOString());
      formData.append("endDate", editing?.endDate || v.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

      if (v.image instanceof File) {
        formData.append("image", v.image);
      }

      const url = editing ? `${API_BASE}/banners/${editing._id}` : `${API_BASE}/banners/`;
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        toast.success(editing ? "Banner updated successfully" : "Banner created successfully");
        fetchBanners();
        setOpen(false);
      } else {
        toast.error(json.message || "Submission failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving banner");
    }
  };

  /* ── Form Fields ── */
  const fields: FormField[] = [
    { name: "title", label: "Banner Title", required: true },
    {
      name: "page", label: "Page Placement", type: "select", required: true, span: 6,
      options: [
        { label: "Homepage", value: "homepage" },
        { label: "Category Page", value: "category" },
        { label: "Checkout Page", value: "checkout" },
        { label: "Products Page", value: "products" },
      ],
    },
    { name: "position", label: "Position Index", type: "number", required: true, span: 6 },
    { name: "redirectUrl", label: "Redirect URL", type: "url", placeholder: "https://…" },
    { name: "image", label: "Banner Image File", type: "file", required: !editing },
    { name: "isActive", label: "Active State", type: "switch" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        subtitle="Hero, promo and sticky banners across the storefront."
        actions={
          <Button className="gap-1.5" onClick={onCreate}>
            <Plus className="h-4 w-4" /> Add banner
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border rounded-xl bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground italic">Fetching storefront banners...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="p-20 text-center text-muted-foreground italic">
          No banners found in the collection.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Card key={b._id} className="p-4 flex items-center gap-4 hover:border-primary/30 transition-colors shadow-sm">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <div className="h-14 w-24 rounded bg-gradient-to-br from-primary/30 to-primary/10 grid place-items-center text-primary overflow-hidden border shrink-0">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">{b.title}</div>
                <div className="text-xs text-muted-foreground flex gap-2 items-center flex-wrap mt-0.5">
                  <Badge variant="outline" className="text-[10px] uppercase bg-primary/5 text-primary border-primary/20">
                    {b.page}
                  </Badge>
                  <span className="opacity-60">Position: {b.position}</span>
                  {b.redirectUrl && (
                    <a 
                      href={b.redirectUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium truncate max-w-[200px]"
                    >
                      Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <Badge variant={b.isActive ? "default" : "secondary"} className="hidden sm:inline-flex">
                {b.isActive ? "Active" : "Inactive"}
              </Badge>
              <Switch checked={b.isActive} onCheckedChange={() => toggle(b._id, b.isActive)} />
              <div className="flex gap-0.5">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(b)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(b._id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog<Banner>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit banner" : "New banner"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ isActive: true, page: "homepage", position: 1 }}
        onSubmit={onSave}
      />
    </div>
  );
}
