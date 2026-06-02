import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Calendar,
  Pencil,
  Trash2,
  X,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/content/blog")({
  component: BlogPage,
});

const API_BASE = API_BASE_URL;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Types ── */
interface KeyFeature {
  title: string;
  description: string;
  _id?: string;
}

interface Conclusion {
  title: string;
  content: string;
}

interface Category {
  _id: string;
  title: string;
  icon?: string;
}

interface SubCategory {
  _id: string;
  title: string;
  category: string | { _id: string };
}

interface Blog {
  _id: string;
  title: string;
  category: Category;
  subCategory: SubCategory;
  icon: string;
  banner: string;
  images: string[];
  description: string;
  keyFeatures: KeyFeature[];
  details: string;
  possibilities: { points: string[] };
  conclusion: Conclusion;

  disable: boolean;
  publishDate: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  Live: "bg-success/15 text-success",
  Disabled: "bg-muted text-muted-foreground",
};

function BlogPage() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBlogs = async (p = page) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/blogs?page=${p}&limit=10`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotalItems(json.pagination.total);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);


  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (p: Blog) => {
    setEditing(p);
    setOpen(true);
  };

  const onDelete = async (p: Blog) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/blog/${p._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((x) => x._id !== p._id));
        toast.success(`Removed ${p.title}`);
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  const toggle = () => {
    toast.error("Status toggle is not allowed");
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog & News"
        subtitle="Articles and announcements."
        actions={
          <Button className="gap-1.5" onClick={onCreate}>
            <Plus className="h-4 w-4" /> New post
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading blogs...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p._id} className="p-4 flex items-center gap-4 flex-wrap">
              <div className="h-14 w-20 rounded bg-muted overflow-hidden shrink-0 border">
                {p.icon && <img src={p.icon} alt={p.title} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {p.category?.title}
                  </Badge>
                  {p.subCategory?.title && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">
                      {p.subCategory.title}
                    </Badge>
                  )}

                </div>
                <div className="font-semibold mt-1">{p.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(p.publishDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge className={p.disable ? statusStyles.Disabled : statusStyles.Live} variant="outline">
                {p.disable ? "Disabled" : "Live"}
              </Badge>
              <Switch checked={!p.disable} disabled />

              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(p)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(p)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground">No blogs found.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{items.length}</span> of{" "}
            <span className="font-medium">{totalItems}</span> blogs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <BlogDialog
        open={open}
        onOpenChange={setOpen}
        blog={editing}
        onSuccess={() => {
          fetchBlogs(page);
          setOpen(false);
        }}
      />
    </div>
  );
}


function BlogDialog({
  open,
  onOpenChange,
  blog,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  blog: Blog | null;
  onSuccess: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [possibilities, setPossibilities] = useState<{ points: string[] }>({ points: [] });
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>([{ title: "", description: "" }]);


  const [conclusion, setConclusion] = useState<Conclusion>({ title: "", content: "" });
  
  const [icon, setIcon] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/sub-category`, { headers: getAuthHeaders() }),
        ]);
        const [catJson, subJson] = await Promise.all([catRes.json(), subRes.json()]);
        if (catJson.success) setCategories(catJson.data);
        if (subJson.success) setSubCategories(subJson.data);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    if (open) fetchOptions();
  }, [open]);

  useEffect(() => {
    if (open && blog) {
      setTitle(blog.title);
      setCategoryId(blog.category?._id || "");
      setSubCategoryId(blog.subCategory?._id || "");
      setDescription(blog.description);
      setDetails(blog.details);
      setKeyFeatures(blog.keyFeatures.length > 0 ? blog.keyFeatures : [{ title: "", description: "" }]);
      setPossibilities(blog.possibilities || { points: [] });
      setConclusion(blog.conclusion || { title: "", content: "" });

    } else if (open && !blog) {
      setTitle("");
      setCategoryId("");
      setSubCategoryId("");
      setDescription("");
      setDetails("");
      setKeyFeatures([{ title: "", description: "" }]);
      setPossibilities({ points: [] });
      setConclusion({ title: "", content: "" });

      setIcon(null);
      setBanner(null);
      setImages([]);
    }
  }, [open, blog]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (!blog) setSubCategoryId("");
  }, [categoryId]);

  const filteredSubs = subCategories.filter((s) => {
    const catId = (s.category && typeof s.category === "object") 
      ? (s.category as any)._id 
      : s.category;
    return catId === categoryId;
  });


  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", categoryId);
      formData.append("subCategory", subCategoryId);
      formData.append("description", description);
      formData.append("details", details);
      
      // Clean up keyFeatures to remove _id as the backend rejects it in updates
      const cleanKeyFeatures = keyFeatures.map(({ _id, ...rest }) => rest);
      formData.append("keyFeatures", JSON.stringify(cleanKeyFeatures));
      
      formData.append("possibilities", JSON.stringify(possibilities));
      formData.append("conclusion", JSON.stringify(conclusion));




      if (icon) formData.append("icon", icon);
      if (banner) formData.append("banner", banner);
      images.forEach((img) => formData.append("images", img));

      const url = blog ? `${API_BASE}/blog/${blog._id}` : `${API_BASE}/create/blog`;
      const method = blog ? "PUT" : "POST";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blog ? "Edit Blog" : "Create Blog"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog title" />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub Category *</Label>
              <Select 
                value={subCategoryId} 
                onValueChange={setSubCategoryId} 
                disabled={!categoryId || filteredSubs.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !categoryId 
                      ? "Select Category First" 
                      : filteredSubs.length === 0 
                        ? "No Subcategories Found" 
                        : "Select Sub Category"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubs.map((s) => (
                    <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="space-y-2">
            <Label>Short Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Full Details (Markdown/HTML supported) *</Label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} />
          </div>

          {/* Files */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="relative h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors overflow-hidden">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setIcon(e.target.files?.[0] || null)} />
                {icon ? (
                  <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-1">
                    <img src={URL.createObjectURL(icon)} className="h-10 w-10 object-contain mb-1" />
                    <span className="text-[8px] truncate w-full text-center">{icon.name}</span>
                  </div>
                ) : blog?.icon ? (
                  <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center p-1">
                    <img src={blog.icon} className="h-10 w-10 object-contain mb-1" />
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
            <div className="space-y-2">
              <Label>Banner</Label>
              <div className="relative h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors overflow-hidden">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setBanner(e.target.files?.[0] || null)} />
                {banner ? (
                  <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-1">
                    <img src={URL.createObjectURL(banner)} className="h-full w-full object-cover" />
                  </div>
                ) : blog?.banner ? (
                  <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center p-1">
                    <img src={blog.banner} className="h-full w-full object-cover opacity-50" />
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">Current Banner</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] mt-1">Upload Banner</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Images</Label>
              <div className="relative h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors overflow-hidden">
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setImages(Array.from(e.target.files || []))} />
                {images.length > 0 ? (
                  <div className="absolute inset-0 bg-background flex flex-col items-center justify-center">
                    <span className="text-xs font-bold">{images.length} new</span>
                    <span className="text-[8px] text-muted-foreground">Replace gallery</span>
                  </div>
                ) : blog?.images && blog.images.length > 0 ? (
                  <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold">{blog.images.length} current</span>
                    <span className="text-[8px] text-muted-foreground">Click to replace</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] mt-1">Gallery</span>
                  </>
                )}
              </div>
            </div>
          </div>


          {/* Key Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Key Features</Label>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setKeyFeatures([...keyFeatures, { title: "", description: "" }])}>
                Add Feature
              </Button>
            </div>
            {keyFeatures.map((kf, i) => (
              <div key={i} className="flex gap-2 items-start border p-2 rounded-md bg-muted/30">
                <div className="flex-1 space-y-2">
                  <Input value={kf.title} onChange={(e) => {
                    const next = [...keyFeatures];
                    next[i].title = e.target.value;
                    setKeyFeatures(next);
                  }} placeholder="Feature Title" className="h-8 text-sm" />
                  <Input value={kf.description} onChange={(e) => {
                    const next = [...keyFeatures];
                    next[i].description = e.target.value;
                    setKeyFeatures(next);
                  }} placeholder="Feature Description" className="h-8 text-sm" />
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setKeyFeatures(keyFeatures.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Possibilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Future Possibilities (Points)</Label>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPossibilities({ points: [...possibilities.points, ""] })}>
                Add Point
              </Button>
            </div>
            {possibilities.points.map((pt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input value={pt} onChange={(e) => {
                  const next = [...possibilities.points];
                  next[i] = e.target.value;
                  setPossibilities({ points: next });
                }} placeholder={`Point ${i+1}`} className="h-8 text-sm" />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setPossibilities({ points: possibilities.points.filter((_, idx) => idx !== i) })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>


          {/* Conclusion */}
          <div className="space-y-3 border p-3 rounded-lg bg-primary/5">
            <Label className="text-primary font-semibold">Conclusion</Label>
            <div className="grid grid-cols-1 gap-3">
              <Input value={conclusion.title} onChange={(e) => setConclusion({ ...conclusion, title: e.target.value })} placeholder="Conclusion Title" />
              <Textarea value={conclusion.content} onChange={(e) => setConclusion({ ...conclusion, content: e.target.value })} placeholder="Conclusion Content" rows={2} />
            </div>
          </div>

        </div>

        <DialogFooter>

          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={submitting || !title || !categoryId || !subCategoryId}>
            {submitting ? "Saving..." : blog ? "Save Changes" : "Create Blog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
