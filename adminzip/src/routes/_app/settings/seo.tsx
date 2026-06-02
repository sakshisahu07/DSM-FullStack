import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Globe } from "lucide-react";

const API_BASE = "https://api.dsmelectro.com/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/_app/settings/seo")({
  component: SEOPage,
});

function SEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchSEO = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/company`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSEO();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/company`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "SEO settings updated");
        setData(json.data);
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading SEO settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO Configuration"
        subtitle="Default meta titles, descriptions and keywords for search engines."
        actions={
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-4 lg:col-span-2">
          <h3 className="font-semibold">Default meta</h3>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Site title (SEO)</Label>
            <Input
              className="mt-1.5"
              value={data?.site_name || ""}
              onChange={(e) => updateField("site_name", e.target.value)}
              placeholder="e.g. DSM Electro — Best Kits"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Recommended &lt; 60 characters.</p>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Meta description</Label>
            <Textarea
              className="mt-1.5 min-h-[100px]"
              value={data?.seo_description || ""}
              onChange={(e) => updateField("seo_description", e.target.value)}
              placeholder="Describe your site for search results..."
            />
            <p className="text-[11px] text-muted-foreground mt-1">Recommended &lt; 160 characters.</p>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Default keywords</Label>
            <Input
              className="mt-1.5"
              value={data?.seo_keyword || ""}
              onChange={(e) => updateField("seo_keyword", e.target.value)}
              placeholder="arduino, kits, electronics, dsm electro"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Search preview
          </h3>
          <div className="rounded-lg border p-4 bg-card shadow-sm">
            <div className="text-[12px] text-muted-foreground mb-0.5 truncate">https://your-store.com</div>
            <div className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight mb-1">
              {data?.site_name || "Enter a site title"}
            </div>
            <div className="text-[13px] text-[#4d5156] line-clamp-2 leading-normal">
              {data?.seo_description || "Provide a meta description to see how your site appears in search results."}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            This is a simulation of how your site might appear in search engine results.
          </p>
        </Card>
      </div>
    </div>
  );
}

