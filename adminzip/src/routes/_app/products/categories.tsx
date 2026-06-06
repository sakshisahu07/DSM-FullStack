import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Pencil, Trash2, Loader2, Upload } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/products/categories")({
  component: CategoriesPage,
});

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Category {
  _id: string;
  title: string;
  icon?: string;
}

function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (c: Category) => { setEditing(c); setOpen(true); };
  const onDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/category/${deleteId}`, { 
        method: "DELETE", 
        headers: getAuthHeaders() 
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Deleted");
        setItems(p => p.filter(x => x._id !== deleteId));
      } else {
        toast.error(json.message);
      }
    } catch (err) { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage top-level product categories."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Add category</Button>}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Card key={c._id} className="p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center overflow-hidden border">
                  {c.icon ? <img src={c.icon} alt={c.title} className="h-full w-full object-cover" /> : <Folder className="h-5 w-5" />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDeleteClick(c._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 font-semibold">{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">ID: {c._id}</div>
            </Card>
          ))}
        </div>
      )}

      <CategoryDialog
        open={open}
        onOpenChange={setOpen}
        category={editing}
        onSuccess={() => {
          fetchCategories();
          setOpen(false);
        }}
      />

      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? All related subcategories, products, and variants will be deleted. This action cannot be undone."
      />
    </div>
  );
}

function DeleteConfirmationDialog({ open, onOpenChange, onConfirm, title, description }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (open) setInput("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm text-muted-foreground">
          <p>{description}</p>
          <div className="space-y-1.5">
            <Label className="text-foreground">Type <span className="font-bold">yes</span> to confirm</Label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="yes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={input.toLowerCase() !== "yes"} onClick={() => { onConfirm(); onOpenChange(false); }}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategoryDialog({ open, onOpenChange, category, onSuccess }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(category?.title ?? "");
      setIcon(null);
    }
  }, [open, category]);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", title);
      if (icon) formData.append("icon", icon);

      const url = category ? `${API_BASE}/category/${category._id}` : `${API_BASE}/create/category`;
      const method = category ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        onSuccess();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sensors"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="relative h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors overflow-hidden">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setIcon(e.target.files?.[0] || null)} />
              {icon ? (
                <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-1">
                  <img src={URL.createObjectURL(icon)} className="h-10 w-10 object-contain mb-1" />
                  <span className="text-[8px] truncate w-full text-center">{icon.name}</span>
                </div>
              ) : category?.icon ? (
                <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center p-1">
                  <img src={category.icon} className="h-10 w-10 object-contain mb-1" />
                  <span className="text-[8px] text-muted-foreground">Current Icon</span>
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] mt-1">Upload Icon</span>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!title.trim() || submitting} onClick={onSubmit}>
            {submitting ? "Saving..." : category ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
