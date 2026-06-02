import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Upload } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/products/subcategories")({
  component: SubcategoriesPage,
});

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Category {
  _id: string;
  title: string;
}

interface SubCategory {
  _id: string;
  title: string;
  category: string | { _id: string; title: string };
  icon?: string;
}

function SubcategoriesPage() {
  const [items, setItems] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubCategory | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/sub-category`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() }),
      ]);
      const [subJson, catJson] = await Promise.all([subRes.json(), catRes.json()]);

      // Handle various API response shapes
      if (subJson.success !== false) {
        const subData = subJson.data?.subCategories || subJson.data?.subcategories || subJson.data;
        setItems(Array.isArray(subData) ? subData : []);
      }
      if (catJson.success !== false) {
        const catData = catJson.data?.categories || catJson.data;
        setCategories(Array.isArray(catData) ? catData : []);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (s: SubCategory) => { setEditing(s); setOpen(true); };
  const onDelete = async (id: string) => {
    if (!confirm("Delete sub-category?")) return;
    try {
      const res = await fetch(`${API_BASE}/sub-category/${id}`, { 
        method: "DELETE", 
        headers: getAuthHeaders() 
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Deleted");
        setItems(p => p.filter(x => x._id !== id));
      } else {
        toast.error(json.message);
      }
    } catch (err) { toast.error("Delete failed"); }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, { title: string; subs: SubCategory[] }>();
    categories.forEach(c => map.set(c._id, { title: c.title, subs: [] }));
    
    items.forEach(s => {
      const catId = typeof s.category === 'object' ? s.category?._id : s.category;
      if (catId && map.has(catId)) {
        map.get(catId)!.subs.push(s);
      }
    });
    return Array.from(map.values()).filter(g => g.subs.length > 0);
  }, [items, categories]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subcategories"
        subtitle="Group subcategories by their parent."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> New subcategory</Button>}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading subcategories...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <Card key={g.title} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{g.title}</h3>
                <span className="text-xs text-muted-foreground">{g.subs.length} subcategories</span>
              </div>
              <div className="space-y-2">
                {g.subs.map((s) => (
                  <div key={s._id} className="flex items-center gap-2 p-2.5 rounded-md hover:bg-muted/50 border">
                    <div className="h-8 w-8 rounded bg-muted overflow-hidden border shrink-0">
                      {s.icon && <img src={s.icon} className="h-full w-full object-cover" />}
                    </div>
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                      {s.title}
                    </Badge>
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(s._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <SubCategoryDialog
        open={open}
        onOpenChange={setOpen}
        subCategory={editing}
        categories={categories}
        onSuccess={() => {
          fetchData();
          setOpen(false);
        }}
      />
    </div>
  );
}

function SubCategoryDialog({ open, onOpenChange, subCategory, categories, onSuccess }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subCategory: SubCategory | null;
  categories: Category[];
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(subCategory?.title ?? "");
      const cat = subCategory?.category;
      setCategoryId(typeof cat === 'object' ? cat?._id : (cat ?? ""));
      setIcon(null);
    }
  }, [open, subCategory]);

  const onSubmit = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!categoryId) { toast.error("Please select a parent category"); return; }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", categoryId);
      if (icon) formData.append("icon", icon);

      const url = subCategory ? `${API_BASE}/sub-category/${subCategory._id}` : `${API_BASE}/sub-category`;
      const method = subCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });

      const json = await res.json();
      if (json.success || res.ok) {
        toast.success(json.message || (subCategory ? "Updated successfully" : "Sub-category created!"));
        onSuccess();
      } else {
        toast.error(json.message || `Error ${res.status}`);
      }
    } catch (err: any) {
      toast.error(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{subCategory ? "Edit sub-category" : "New sub-category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arduino Boards"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Parent Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select Parent" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Icon</Label>
            {/* Hidden file input - triggered via ref */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setIcon(e.target.files?.[0] || null)}
            />
            <div
              className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {icon ? (
                <div className="flex flex-col items-center justify-center gap-1 p-2">
                  <img src={URL.createObjectURL(icon)} className="h-12 w-12 object-contain rounded" />
                  <span className="text-[9px] text-muted-foreground truncate max-w-[140px] text-center">{icon.name}</span>
                  <span className="text-[9px] text-green-600 font-medium">✓ New icon selected</span>
                </div>
              ) : subCategory?.icon ? (
                <div className="flex flex-col items-center justify-center gap-1 p-2">
                  <img src={subCategory.icon} className="h-12 w-12 object-contain rounded" />
                  <span className="text-[9px] text-muted-foreground">Current icon — click to change</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Click to upload icon</span>
                  <span className="text-[10px] text-muted-foreground/60">PNG, JPG, SVG</span>
                </div>
              )}
            </div>
            {icon && (
              <button
                type="button"
                className="text-[10px] text-destructive hover:underline"
                onClick={() => { setIcon(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              >
                Remove selected file
              </button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!title.trim() || !categoryId || submitting} onClick={onSubmit}>
            {submitting ? "Saving..." : subCategory ? "Save changes" : "Create sub-category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
