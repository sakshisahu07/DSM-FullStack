import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Upload, Globe } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { CardGridSkeleton } from "@/components/loading-skeletons";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

export const Route = createFileRoute("/_app/products/brands")({
  component: BrandsPage,
});

interface Brand {
  _id: string;
  brandName: string;
  icon?: string;
  category?: string | { _id: string; title: string };
  subCategory?: string | { _id: string; title: string };
  disable: boolean;
  createdAt: string;
}

function BrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/brands?page=1&limit=100`);
      const json = await res.json();
      if (json.success !== false) {
        const brandsData = json.data?.brands || json.data || [];
        setItems(Array.isArray(brandsData) ? brandsData : []);
      }
    } catch (err) {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (b: Brand) => { setEditing(b); setOpen(true); };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      const res = await apiFetch(`${API_BASE}/brand/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Brand deleted successfully");
        setItems((p) => p.filter((x) => x._id !== id));
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting brand");
    }
  };

  const toggleStatus = async (brand: Brand) => {
    try {
      const res = await apiFetch(`${API_BASE}/brand/${brand._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Status updated");
        setItems((p) => p.map((x) => x._id === brand._id ? { ...x, disable: !x.disable } : x));
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        subtitle="Manage product brands, categories and logos."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Add brand</Button>}
      />

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <Card className="p-20 text-center space-y-3">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <div className="text-muted-foreground">No brands found. Create your first brand to get started.</div>
          <Button variant="outline" onClick={onCreate}>Add Brand</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((b) => (
            <Card key={b._id} className="p-5 group hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <Switch
                  checked={!b.disable}
                  onCheckedChange={() => toggleStatus(b)}
                  className="scale-75"
                />
              </div>
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                {b.icon ? (
                  <img src={b.icon} alt={b.brandName} className="h-full w-full object-contain p-2" />
                ) : (
                  <Globe className="h-8 w-8 text-muted-foreground opacity-20" />
                )}
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-bold truncate">{b.brandName}</div>
                  <div className="text-[10px] text-muted-foreground uppercase mt-0.5">
                    {b.category && typeof b.category === 'object' ? b.category.title : "No Category"}
                  </div>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(b._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BrandDialog
        open={open}
        onOpenChange={setOpen}
        brand={editing}
        onSave={() => {
          setOpen(false);
          fetchBrands();
        }}
      />
    </div>
  );
}

function BrandDialog({ open, onOpenChange, brand, onSave }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  brand: Brand | null;
  onSave: () => void;
}) {
  const [name, setName] = useState("");
  const [catId, setCatId] = useState("");
  const [subCatId, setSubCatId] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setName(brand?.brandName ?? "");
      setCatId(typeof brand?.category === 'object' ? brand.category._id : (brand?.category ?? ""));
      setSubCatId(typeof brand?.subCategory === 'object' ? brand.subCategory._id : (brand?.subCategory ?? ""));
      setPreview(brand?.icon ?? "");
      setIcon(null);

      // Fetch categories/subcategories
      const fetchMetadata = async () => {
        try {
          const [cRes, sRes] = await Promise.all([
            apiFetch(`${API_BASE}/categories`),
            apiFetch(`${API_BASE}/sub-category`)
          ]);
          const [cJson, sJson] = await Promise.all([cRes.json(), sRes.json()]);
          if (cJson.success !== false) {
            const catData = cJson.data?.categories || cJson.data || [];
            setCategories(Array.isArray(catData) ? catData : []);
          }
          if (sJson.success !== false) {
            const subData = sJson.data?.subCategories || sJson.data?.subcategories || sJson.data || [];
            setSubCategories(Array.isArray(subData) ? subData : []);
          }
        } catch (err) {
          console.error("Failed to load dialog metadata", err);
        }
      };
      fetchMetadata();
    }
  }, [open, brand]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("brandName", name);
      formData.append("category", catId);
      formData.append("subCategory", subCatId);
      if (icon) formData.append("icon", icon);

      const url = brand ? `${API_BASE}/brand/${brand._id}` : `${API_BASE}/brand`;
      const method = brand ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        toast.success(brand ? "Brand updated" : "Brand created");
        onSave();
      } else {
        toast.error(json.message || "Failed to save brand");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "New Brand"}</DialogTitle>
          <DialogDescription>Enter brand details and upload a logo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Brand Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sony, Samsung"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={catId} onValueChange={setCatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Select value={subCatId} onValueChange={setSubCatId} disabled={!catId}>
                <SelectTrigger>
                  <SelectValue placeholder="Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories
                    .filter(s => {
                      const scid = typeof s.category === 'object' ? s.category._id : s.category;
                      return scid === catId;
                    })
                    .map((s) => (
                      <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Brand Logo</Label>
            <div className="flex items-center gap-4">
              {preview && (
                <div className="h-16 w-16 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                  <img src={preview} alt="Preview" className="h-full w-full object-contain p-1" />
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="brand-icon" className="flex items-center justify-center h-16 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-border">
                  <div className="flex flex-col items-center text-[10px] text-muted-foreground">
                    <Upload className="h-4 w-4 mb-1" />
                    {icon ? icon.name : "Upload Logo"}
                  </div>
                  <input
                    id="brand-icon"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIcon(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!name || !catId || saving} onClick={handleSubmit}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {brand ? "Save changes" : "Create brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
