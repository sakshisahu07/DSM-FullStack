import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const API_BASE = API_BASE_URL;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/_app/settings/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/company`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load contact info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
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
        toast.success(json.message || "Contact details updated");
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
        <p className="text-sm text-muted-foreground">Loading contact info...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Details"
        subtitle="Phones, emails and registered address shown on the website."
        actions={
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <SectionTitle icon={<Phone className="h-4 w-4" />} title="Phone numbers" />
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Primary Phone</Label>
              <Input
                className="mt-1.5"
                value={data?.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Secondary Phone</Label>
              <Input
                className="mt-1.5"
                value={data?.phone1 || ""}
                onChange={(e) => updateField("phone1", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">WhatsApp Number</Label>
              <Input
                className="mt-1.5"
                value={data?.whatsapp || ""}
                onChange={(e) => updateField("whatsapp", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <SectionTitle icon={<Mail className="h-4 w-4" />} title="Email addresses" />
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Support Email</Label>
              <Input
                className="mt-1.5"
                value={data?.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Google My Business Link</Label>
              <Input
                className="mt-1.5"
                value={data?.googleMyBusiness || ""}
                onChange={(e) => updateField("googleMyBusiness", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Playstore Link</Label>
              <Input
                className="mt-1.5"
                value={data?.playstoreLink || ""}
                onChange={(e) => updateField("playstoreLink", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          <SectionTitle icon={<MapPin className="h-4 w-4" />} title="Registered address" />
          <div className="pt-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Full Address</Label>
            <Input
              className="mt-1.5"
              value={data?.address || ""}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b">
      <span className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">{icon}</span>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

