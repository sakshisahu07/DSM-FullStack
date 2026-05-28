import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const API_BASE = API_BASE_URL;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/_app/settings/company")({
  component: CompanyPage,
});

function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/company`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load company info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
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
        toast.success(json.message || "Company updated successfully");
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
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Info"
        subtitle="Brand identity and basic information shown across the storefront."
        actions={
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h3 className="font-semibold">General</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Company name</Label>
              <Input
                value={data?.site_name || ""}
                onChange={(e) => updateField("site_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">GSTIN</Label>
              <Input
                value={data?.gst || ""}
                onChange={(e) => updateField("gst", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Phone</Label>
              <Input
                value={data?.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
              <Input
                value={data?.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Address</Label>
              <Textarea
                value={data?.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <div className="space-y-1.5 pt-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">About Company</Label>
            <Textarea
              className="min-h-[120px]"
              value={data?.about_us || ""}
              onChange={(e) => updateField("about_us", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
            <Textarea
              className="min-h-[80px]"
              value={data?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Brand assets</h3>
          <div className="space-y-4">
            <AssetUpload
              label="Header Logo"
              value={data?.header_logo}
              onUpload={(v) => updateField("header_logo", v)}
            />
            <AssetUpload
              label="Footer Logo"
              value={data?.footer_logo}
              onUpload={(v) => updateField("footer_logo", v)}
            />
            <AssetUpload
              label="Favicon"
              value={data?.fav_icon}
              onUpload={(v) => updateField("fav_icon", v)}
              compact
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function AssetUpload({ label, value, onUpload, compact }: {
  label: string;
  value?: string;
  onUpload: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className={`mt-2 ${compact ? "h-20" : "h-32"} rounded-lg border-2 border-dashed border-border relative overflow-hidden group bg-muted/30 grid place-items-center`}>
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5">
                <Upload className="h-3 w-3" /> Change
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center text-[11px] text-muted-foreground">
            <Upload className="h-4 w-4 mx-auto mb-1 opacity-50" />
            Upload {label}
          </div>
        )}
      </div>
    </div>
  );
}

