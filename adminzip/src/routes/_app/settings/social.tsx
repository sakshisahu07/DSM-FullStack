import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Facebook, Instagram, Youtube, Linkedin, Twitter, Loader2, Share2 } from "lucide-react";

const API_BASE = "https://api.dsmelectro.com/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/_app/settings/social")({
  component: SocialPage,
});

const socialConfigs = [
  { key: "facebook", label: "Facebook", icon: Facebook, color: "text-[#1877F2]" },
  { key: "instagram", label: "Instagram", icon: Instagram, color: "text-[#E4405F]" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "text-[#FF0000]" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]" },
  { key: "twitter", label: "X / Twitter", icon: Twitter, color: "text-foreground" },
  { key: "pinterest", label: "Pinterest", icon: Share2, color: "text-[#BD081C]" },
];

function SocialPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchSocials = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/company`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load social links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
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
        toast.success(json.message || "Social links updated");
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
        <p className="text-sm text-muted-foreground">Loading social links...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Links"
        subtitle="Social media URLs and handles displayed in the footer."
        actions={
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      <Card className="p-6 space-y-5">
        {socialConfigs.map((s) => (
          <div key={s.key} className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-lg bg-muted grid place-items-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</Label>
              <Input
                className="mt-1"
                value={data?.[s.key] || ""}
                onChange={(e) => updateField(s.key, e.target.value)}
                placeholder={`https://${s.key}.com/yourprofile`}
              />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

