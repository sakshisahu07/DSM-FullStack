import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, CreditCard, Wallet, Smartphone, Banknote, Loader2, IndianRupee } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const API_BASE = "https://api.dsmelectro.com/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/_app/settings/payments")({
  component: PaymentsPage,
});

const gateways: { name: string; icon: LucideIcon; desc: string; fee: string; enabled: boolean }[] = [
  { name: "UPI (Razorpay)", icon: Smartphone, desc: "BHIM, GPay, PhonePe, Paytm UPI", fee: "0% (intra-bank)", enabled: true },
  { name: "Cards", icon: CreditCard, desc: "Visa, Mastercard, RuPay, Amex", fee: "2% + ₹2", enabled: true },
  { name: "Wallets", icon: Wallet, desc: "Paytm, MobiKwik, Amazon Pay", fee: "1.5%", enabled: true },
  { name: "Cash on Delivery", icon: Banknote, desc: "COD up to ₹10,000", fee: "₹40 / order", enabled: false },
];

function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/company`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
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
        toast.success(json.message || "Payment settings updated");
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
    setData((prev: any) => ({ ...prev, [key]: Number(value) }));
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
        title="Payments & Checkout"
        subtitle="Payment gateways and delivery charge settings."
        actions={
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" /> Checkout Charges
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Delivery Fee (₹)</Label>
                <Input
                  type="number"
                  value={data?.productDeliveryFee || 0}
                  onChange={(e) => updateField("productDeliveryFee", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Min Order for Free Delivery (₹)</Label>
                <Input
                  type="number"
                  value={data?.minDelAmount || 0}
                  onChange={(e) => updateField("minDelAmount", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Admin Charge (%)</Label>
                <Input
                  type="number"
                  value={data?.adminCharge || 0}
                  onChange={(e) => updateField("adminCharge", e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Razorpay credentials</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Key ID" defaultValue="rzp_live_abc123def456" />
              <Field label="Key Secret" defaultValue="••••••••••••••••" type="password" />
              <Field label="Webhook Secret" defaultValue="••••••••" type="password" />
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold px-1">Payment Gateways</h3>
          {gateways.map((g) => (
            <Card key={g.name} className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <g.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.desc}</div>
              </div>
              <div className="text-right mr-2">
                <div className="text-sm font-medium">{g.fee}</div>
                <div className="text-[11px] text-muted-foreground">fee</div>
              </div>
              <Switch defaultChecked={g.enabled} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input className="mt-1.5 font-mono" defaultValue={defaultValue} type={type} />
    </div>
  );
}

