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

export const Route = createFileRoute("/_app/content/video-gallery")({
  component: ContentVideos,
});

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  categoryId: string;
  subCategoryId: string;
  views: number;
  url: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "https://priyashu.in/api/v1";
const API_VIDEO = `${API_BASE}/video`;

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("dsm_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};



function ContentVideos() {
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
      const res = await fetch(`${API_VIDEO}?limit=20`, { headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) {
        setItems(json.data.map((v: any) => ({
          id: v._id,
          title: v.title,
          description: v.description,
          duration: v.duration,
          categoryId: v.categoryId,
          subCategoryId: v.subCategoryId,
          views: v.views,
          url: v.video?.url || "",
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
    { name: "video", label: "Video File", type: "file", required: true },
  ];

  const onCreate = () => { setEditing(null); setOpen(true); };
  
  const onPlay = async (v: Video) => {
    setPlayingId(v.id);
    
    // Increment view counter
    try {
      await fetch(`${API_VIDEO}/${v.id}/view`, { 
        method: "PUT",
        headers: getAuthHeader() 
      });
      // Optional: Refresh count after a delay or on next load
    } catch (e) {}
  };

  const onDelete = async (v: Video) => {
    if (!window.confirm(`Delete ${v.title}?`)) return;
    try {
      const res = await fetch(`${API_VIDEO}/${v.id}`, { 
        method: "DELETE", 
        headers: getAuthHeader() 
      });
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
        title="Video Gallery"
        subtitle="Storefront-facing videos."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Upload</Button>}
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border rounded-xl bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground italic">Fetching video collection...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="p-20 text-center text-muted-foreground italic">No videos in the gallery yet.</Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => (
            <Card key={v.id} className="overflow-hidden group border-primary/10 hover:border-primary/40 transition-all shadow-md">
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
                    className="w-full h-full grid place-items-center cursor-pointer group"
                    onClick={() => onPlay(v)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white group-hover:bg-primary group-hover:scale-110 transition-all duration-300 relative z-10">
                      <Play className="h-6 w-6 ml-1 fill-current" />
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-medium z-10">
                      <Clock className="h-3 w-3 text-primary" /> {Math.floor(v.duration / 60)}:{(v.duration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                    ID: {v.categoryId.slice(-4)}
                  </Badge>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase">{new Date(v.createdAt).toLocaleDateString()}</div>
                </div>
                <h3 className="font-semibold text-base line-clamp-1 mb-1" title={v.title}>{v.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">{v.description}</p>
                <div className="flex items-center justify-between border-t border-primary/5 pt-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Eye className="h-3.5 w-3.5 text-primary" /> {v.views.toLocaleString()} <span className="ml-1 opacity-60">views</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(v)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
        defaultValues={{}}
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
