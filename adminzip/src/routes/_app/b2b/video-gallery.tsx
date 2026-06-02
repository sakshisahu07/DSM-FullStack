import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Play, Pencil, Trash2, Loader2, Clock, Eye } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { useEffect, useCallback } from "react";

export const Route = createFileRoute("/_app/b2b/video-gallery")({
  component: B2BVideoGallery,
});

interface Video {
  id: string;
  title: string;
  description?: string;
  duration: number;
  categoryId: string;
  subCategoryId?: string;
  views: number;
  url: string;
  createdAt?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";
const API_VIDEO = `${API_BASE}/video`;

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("dsm_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

function B2BVideoGallery() {
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ label: string; value: string }[]>([]);

  const fetchBaseData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) {
        setCategories(json.data.map((c: any) => ({ label: c.title, value: c._id })));
      }
    } catch (e) {}
  }, []);

  const fetchSubCategories = async (catId: string) => {
    try {
      const res = await fetch(`${API_BASE}/sub-category`, { headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) {
        const filtered = json.data
          .filter((s: any) => (typeof s.category === 'object' ? s.category?._id : s.category) === catId)
          .map((s: any) => ({ label: s.title, value: s._id }));
        setSubCategories(filtered);
      }
    } catch (e) {}
  };

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_VIDEO}?limit=50`, { headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) {
        setItems(json.data.map((v: any) => ({
          id: v._id,
          title: v.title,
          description: v.description,
          duration: v.duration || 0,
          categoryId: v.categoryId,
          subCategoryId: v.subCategoryId,
          views: v.views || 0,
          url: v.video?.url || v.url || "",
          createdAt: v.createdAt,
        })));
      }
    } catch (error) {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    fetchBaseData();
  }, [fetchVideos, fetchBaseData]);

  const fields: FormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "categoryId", label: "Category", type: "select", options: categories, required: true, span: 6 },
    { name: "subCategoryId", label: "Subcategory", type: "select", options: subCategories, required: true, span: 6, disabled: subCategories.length === 0 },
    { name: "duration", label: "Duration (seconds)", type: "number", required: true, span: 6 },
    { name: "video", label: "Video File", type: "file", required: true, span: 6 },
  ];

  const onCreate = () => { setEditing(null); setOpen(true); };
  
  const onPlay = async (v: Video) => {
    setPlayingId(v.id);
    try {
      await fetch(`${API_VIDEO}/${v.id}/view`, { method: "PUT", headers: getAuthHeader() });
    } catch (e) {}
  };

  const onDelete = async (v: Video) => {
    if (!window.confirm(`Delete ${v.title}?`)) return;
    try {
      const res = await fetch(`${API_VIDEO}/${v.id}`, { method: "DELETE", headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) {
        toast.success("Video removed");
        fetchVideos();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="B2B Video Gallery"
        subtitle="Sales and training videos for B2B clients."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Upload</Button>}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border rounded-xl bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground italic">Fetching video collection...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="p-20 text-center text-muted-foreground italic">No videos found.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((v) => (
            <Card key={v.id} className="overflow-hidden group">
              <div className="aspect-video bg-black relative overflow-hidden">
                {playingId === v.id ? (
                  <video 
                    src={v.url} 
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay 
                    onEnded={() => setPlayingId(null)}
                  />
                ) : (
                  <div 
                    className="w-full h-full grid place-items-center cursor-pointer group bg-gradient-to-br from-primary/30 to-primary/5 relative"
                    onClick={() => onPlay(v)}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="h-12 w-12 rounded-full bg-white/90 grid place-items-center text-primary group-hover:scale-110 transition-transform z-10">
                      <Play className="h-5 w-5 ml-0.5 fill-current" />
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-medium z-10">
                      <Clock className="h-3 w-3 text-primary" /> {Math.floor(v.duration / 60)}:{(v.duration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="secondary" className="text-[10px] truncate max-w-[120px]">{v.categoryId.slice(-6)}</Badge>
                  {v.createdAt && <div className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</div>}
                </div>
                <div className="font-medium text-sm line-clamp-2" title={v.title}>{v.title}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {v.views.toLocaleString()} views
                </div>
                <div className="mt-2 flex justify-end gap-1 border-t border-primary/5 pt-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => onDelete(v)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog<Video>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit video" : "Upload video"}
        fields={fields}
        initialValues={editing}
        onValueChange={(name, val) => {
          if (name === "categoryId") {
            fetchSubCategories(val);
          }
        }}
        onSubmit={async (v: any) => {
          try {
            const formData = new FormData();
            formData.append("title", v.title);
            formData.append("description", v.description);
            formData.append("categoryId", v.categoryId);
            formData.append("subCategoryId", v.subCategoryId);
            formData.append("duration", v.duration.toString());
            if (v.video) formData.append("video", v.video);

            const res = await fetch(API_VIDEO, {
              method: "POST",
              headers: getAuthHeader(),
              body: formData,
            });
            const json = await res.json();
            if (json.success) {
              toast.success("Video uploaded successfully");
              fetchVideos();
              setOpen(false);
              setSubCategories([]); // Reset for next time
            } else {
              toast.error(json.message || "Upload failed");
            }
          } catch (error) {
            toast.error("Operation failed");
          }
        }}
      />
    </div>
  );
}
