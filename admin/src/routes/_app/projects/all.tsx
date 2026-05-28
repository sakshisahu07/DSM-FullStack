import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Cpu, Pencil, Trash2, Loader2 } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";

/* ── Route ── */
export const Route = createFileRoute("/_app/projects/all")({
  component: ProjectsPage,
});

/* ── Types ── */
interface Project {
  _id: string;
  title: string;
  projectType: string;
  mrp: number;
  discount: number;
  finalPrice: number;
  description: string;
  disable: boolean;
  icon?: string;
  category?: { _id: string; title: string; };
  subCategory?: { _id: string; title: string; };
}

interface Category { _id: string; title: string; }
interface SubCategory { _id: string; title: string; category: { _id: string; }; }

const API_BASE = import.meta.env.VITE_API_URL || "https://priyashu.in/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Component ── */
function ProjectsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  /* ── API: Fetch Projects ── */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/projects`, { headers: getAuthHeaders() });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("dsm_token");
        navigate({ to: "/login" });
        return;
      }
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /* ── API: Fetch Options ── */
  const fetchOptions = useCallback(async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/sub-category`, { headers: getAuthHeaders() })
      ]);
      const [catJson, subJson] = await Promise.all([catRes.json(), subRes.json()]);
      if (catJson.success) setCategories(catJson.data);
      if (subJson.success) setSubCategories(subJson.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchOptions();
  }, [fetchProjects, fetchOptions]);

  /* ── Form Logic ── */
  const filteredSubCats = useMemo(() => {
    if (!selectedCatId) return [];
    return subCategories.filter(s => {
      const catId = (typeof s.category === 'object' && s.category) ? s.category._id : s.category;
      return catId === selectedCatId;
    });
  }, [selectedCatId, subCategories]);

  const fields: FormField[] = [
    { name: "title", label: "Project Title", required: true },
    {
      name: "projectType", label: "Project Type", type: "select", required: true, span: 6,
      options: [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
      ],
    },
    { name: "mrp", label: "MRP (₹)", type: "number", required: true, span: 6 },
    { name: "discount", label: "Discount (%)", type: "number", span: 6 },
    {
      name: "category", label: "Category", type: "select", required: true, span: 6,
      options: categories.map(c => ({ label: c.title, value: c._id }))
    },
    {
      name: "subCategory", label: "Sub-Category", type: "select", required: true, span: 6,
      disabled: !selectedCatId,
      options: filteredSubCats.map(s => ({ label: s.title, value: s._id })),
      placeholder: selectedCatId ? "Select sub-category" : "Select category first"
    },
    { name: "description", label: "Description", type: "textarea", required: true },
  ];

  const onSave = async (v: any) => {
    try {
      const url = editing ? `${API_BASE}/project/${editing._id}` : `${API_BASE}/create/project`;
      const method = editing ? "PUT" : "POST";
      const formData = new FormData();
      const restricted = ["disable", "_id", "__v", "createdAt", "updatedAt"];
      
      Object.entries(v).forEach(([key, val]: [string, any]) => {
        if (!restricted.includes(key) && val !== undefined && val !== null) {
          const finalVal = (typeof val === 'object' && val?._id) ? val._id : val;
          formData.append(key, finalVal);
        }
      });

      const res = await fetch(url, { method, headers: getAuthHeaders(), body: formData });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchProjects();
        setOpen(false);
      } else {
        toast.error(json.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`${API_BASE}/project/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        toast.success("Deleted");
        setItems(p => p.filter(x => x._id !== id));
      }
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleStatus = async (p: Project) => {
    try {
      const willBeDisabled = !p.disable;
      // Optimistic update
      setItems(prev => prev.map(x => x._id === p._id ? { ...x, disable: willBeDisabled } : x));
      
      const res = await fetch(`${API_BASE}/project/${p._id}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ disable: willBeDisabled })
      });
      const json = await res.json();
      if (!json.success) {
        // Revert
        setItems(prev => prev.map(x => x._id === p._id ? { ...x, disable: !willBeDisabled } : x));
        toast.error(json.message || "Failed to update project status");
      } else {
        toast.success(`Project ${willBeDisabled ? "disabled" : "enabled"} successfully`);
      }
    } catch (err: any) {
      // Revert
      setItems(prev => prev.map(x => x._id === p._id ? { ...x, disable: p.disable } : x));
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Bundles"
        subtitle="Manage projects with category and sub-category relationships."
        actions={
          <Button className="gap-1.5" onClick={() => { setEditing(null); setSelectedCatId(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <Card key={p._id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 overflow-hidden">
                      {p.icon ? <img src={p.icon} alt={p.title} className="h-full w-full object-cover" /> : <Cpu className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate text-sm">{p.title}</h3>
                        {p.category && <Badge variant="outline" className="text-[10px] py-0">{p.category.title}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {p.projectType} • {p.subCategory?.title || "No Subcat"}
                      </div>
                    </div>
                  </div>
                  <Switch checked={!p.disable} onCheckedChange={() => toggleStatus(p)} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold">₹{p.finalPrice?.toLocaleString("en-IN")}</div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { 
                    // Flatten category/subcategory objects to IDs for the form
                    const editData = {
                      ...p,
                      category: p.category?._id || p.category,
                      subCategory: p.subCategory?._id || p.subCategory
                    };
                    setEditing(editData as any); 
                    setSelectedCatId(p.category?._id || (typeof p.category === 'string' ? p.category : null));
                    setOpen(true); 
                  }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(p._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog<any>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit project" : "New project bundle"}
        fields={fields}
        initialValues={editing}
        onValueChange={(name, val) => {
          if (name === "category") setSelectedCatId(val);
        }}
        onSubmit={onSave}
      />
    </div>
  );
}
