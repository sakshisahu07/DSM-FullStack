import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const API_BASE = API_BASE_URL;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/_app/settings/legal")({
  component: LegalPage,
});

const policyConfigs = [
  { key: "term_condition", label: "Terms of Service" },
  { key: "privacy_policy", label: "Privacy Policy" },
  { key: "refund_policy", label: "Refund Policy" },
  { key: "shippingAndDelivery", label: "Shipping Policy" },
];

function LegalPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchLegal = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/company`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load legal policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegal();
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
        toast.success(json.message || "Policies updated");
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
        <p className="text-sm text-muted-foreground">Loading policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Legal Policies"
        subtitle="Terms, privacy, refund and shipping policies."
        actions={
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <Tabs defaultValue="term_condition">
          <TabsList className="m-4">
            {policyConfigs.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
            ))}
          </TabsList>
          {policyConfigs.map((p) => (
            <TabsContent key={p.key} value={p.key} className="px-4 pb-4 mt-0">
              <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Editing: <strong className="text-foreground">{p.label}</strong>
                </div>
                <span className="text-xs">Markdown/HTML supported</span>
              </div>
              <Textarea
                className="min-h-[450px] font-mono text-sm leading-relaxed"
                value={data?.[p.key] || ""}
                onChange={(e) => updateField(p.key, e.target.value)}
                placeholder={`Enter ${p.label.toLowerCase()} content here...`}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}

