import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, CreditCard, Wallet, Smartphone, Banknote, Loader2, IndianRupee, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { apiFetch } from "@/lib/api";

const API_BASE = "https://api.dsmelectro.com/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dsm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const Route = createFileRoute("/_app/settings/payments")({
  component: PaymentsPage,
});

interface WeightSlab {
  _id?: string;
  minWeight: number;
  maxWeight: number;
  charge: number;
}

interface DistanceSlab {
  _id?: string;
  minDistance: number;
  maxDistance: number;
  charge: number;
}

interface ShippingConfig {
  warehousePincode: string;
  weightSlabs: WeightSlab[];
  distanceSlabs: DistanceSlab[];
  modeSurcharges: { air: number; road: number; };
  freeDeliveryThreshold: { air: number | null; road: number | null; both: number | null; };
}

const defaultSlabs: WeightSlab[] = [
  { minWeight: 0, maxWeight: 1, charge: 50 },
  { minWeight: 1, maxWeight: 5, charge: 100 },
  { minWeight: 5, maxWeight: 10, charge: 150 },
];

const gateways: { name: string; icon: LucideIcon; desc: string; fee: string; enabled: boolean }[] = [
  { name: "UPI (Razorpay)", icon: Smartphone, desc: "BHIM, GPay, PhonePe, Paytm UPI", fee: "0% (intra-bank)", enabled: true },
  { name: "Cards", icon: CreditCard, desc: "Visa, Mastercard, RuPay, Amex", fee: "2% + ₹2", enabled: true },
  { name: "Wallets", icon: Wallet, desc: "Paytm, MobiKwik, Amazon Pay", fee: "1.5%", enabled: true },
  { name: "Cash on Delivery", icon: Banknote, desc: "COD up to ₹10,000", fee: "₹40 / order", enabled: false },
];

function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null); // Company data

  // Shipping Config State
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    warehousePincode: "462022",
    weightSlabs: [],
    distanceSlabs: [],
    modeSurcharges: { air: 150, road: 100 },
    freeDeliveryThreshold: { air: null, road: null, both: null },
  });
  const [savingShipping, setSavingShipping] = useState(false);

  // Modal State for Weight Slabs
  const [open, setOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<WeightSlab | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Modal State for Distance Slabs
  const [openDistance, setOpenDistance] = useState(false);
  const [editingDistanceSlab, setEditingDistanceSlab] = useState<DistanceSlab | null>(null);
  const [editingDistanceIndex, setEditingDistanceIndex] = useState<number | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE}/company`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load payment settings");
    }
  };

  const fetchConfig = useCallback(async () => {
    try {
      const res = await apiFetch("/shipping-config");
      const json = await res.json();
      if (json.success && json.data) {
        setShippingConfig({
          warehousePincode: json.data.warehousePincode || "462022",
          weightSlabs: json.data.weightSlabs || [],
          distanceSlabs: json.data.distanceSlabs || [],
          modeSurcharges: json.data.modeSurcharges || { air: 150, road: 100 },
          freeDeliveryThreshold: json.data.freeDeliveryThreshold || { air: null, road: null, both: null },
        });
      }
    } catch (err) {
      toast.error("Failed to load shipping config");
    }
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPayments(), fetchConfig()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [fetchConfig]);

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

  const saveShippingConfig = async (newConfig: ShippingConfig) => {
    setSavingShipping(true);
    try {
      const res = await apiFetch("/admin/shipping-config", {
        method: "POST",
        body: JSON.stringify(newConfig),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Shipping configuration saved!");
        fetchConfig();
      } else {
        toast.error(json.message || "Failed to save configuration");
      }
    } catch (err) {
      toast.error("An error occurred while saving shipping config");
    } finally {
      setSavingShipping(false);
    }
  };

  // Slab handlers
  const onAddSlab = () => { setEditingSlab(null); setEditingIndex(null); setOpen(true); };
  const onEditSlab = (slab: WeightSlab, index: number) => { setEditingSlab(slab); setEditingIndex(index); setOpen(true); };
  const onDeleteSlab = (index: number) => {
    const newSlabs = [...shippingConfig.weightSlabs];
    newSlabs.splice(index, 1);
    const newConfig = { ...shippingConfig, weightSlabs: newSlabs };
    setShippingConfig(newConfig);
    saveShippingConfig(newConfig);
  };

  const handleSlabSubmit = (v: any) => {
    const minWeight = parseFloat(v.minWeight);
    const maxWeight = parseFloat(v.maxWeight);
    const charge = parseFloat(v.charge);

    if (minWeight >= maxWeight) {
      toast.error("Max weight must be greater than Min weight");
      return;
    }

    const newSlabs = [...shippingConfig.weightSlabs];
    const newSlab = { minWeight, maxWeight, charge };

    if (editingIndex !== null) {
      newSlabs[editingIndex] = newSlab;
    } else {
      newSlabs.push(newSlab);
    }

    newSlabs.sort((a, b) => a.minWeight - b.minWeight);
    const newConfig = { ...shippingConfig, weightSlabs: newSlabs };
    setShippingConfig(newConfig);
    saveShippingConfig(newConfig);
    setOpen(false);
  };

  // Distance Slab handlers
  const onAddDistanceSlab = () => { setEditingDistanceSlab(null); setEditingDistanceIndex(null); setOpenDistance(true); };
  const onEditDistanceSlab = (slab: DistanceSlab, index: number) => { setEditingDistanceSlab(slab); setEditingDistanceIndex(index); setOpenDistance(true); };
  const onDeleteDistanceSlab = (index: number) => {
    const newSlabs = [...shippingConfig.distanceSlabs];
    newSlabs.splice(index, 1);
    const newConfig = { ...shippingConfig, distanceSlabs: newSlabs };
    setShippingConfig(newConfig);
    saveShippingConfig(newConfig);
  };

  const handleDistanceSlabSubmit = (v: any) => {
    const minDistance = parseFloat(v.minDistance);
    const maxDistance = parseFloat(v.maxDistance);
    const charge = parseFloat(v.charge);

    if (minDistance >= maxDistance) {
      toast.error("Max distance must be greater than Min distance");
      return;
    }

    const newSlabs = [...shippingConfig.distanceSlabs];
    const newSlab = { minDistance, maxDistance, charge };

    if (editingDistanceIndex !== null) {
      newSlabs[editingDistanceIndex] = newSlab;
    } else {
      newSlabs.push(newSlab);
    }

    newSlabs.sort((a, b) => a.minDistance - b.minDistance);
    const newConfig = { ...shippingConfig, distanceSlabs: newSlabs };
    setShippingConfig(newConfig);
    saveShippingConfig(newConfig);
    setOpenDistance(false);
  };

  const handleModeChange = (key: 'air' | 'road', val: string) => {
    setShippingConfig(p => ({ ...p, modeSurcharges: { ...p.modeSurcharges, [key]: parseFloat(val) || 0 } }));
  };

  const handleThresholdChange = (key: 'air' | 'road' | 'both', val: string) => {
    setShippingConfig(p => ({ ...p, freeDeliveryThreshold: { ...p.freeDeliveryThreshold, [key]: val ? parseFloat(val) : null } }));
  };

  const seedSlabs = () => {
    const newConfig = { ...shippingConfig, weightSlabs: defaultSlabs };
    setShippingConfig(newConfig);
    saveShippingConfig(newConfig);
  };

  const slabFields: FormField[] = [
    { name: "minWeight", label: "Min Weight (kg)", type: "number", required: true, span: 6 },
    { name: "maxWeight", label: "Max Weight (kg)", type: "number", required: true, span: 6 },
    { name: "charge", label: "Charge (₹)", type: "number", required: true, span: 12 },
  ];

  const distanceSlabFields: FormField[] = [
    { name: "minDistance", label: "Min Distance (km)", type: "number", required: true, span: 6 },
    { name: "maxDistance", label: "Max Distance (km)", type: "number", required: true, span: 6 },
    { name: "charge", label: "Charge (₹)", type: "number", required: true, span: 12 },
  ];

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
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Payments & Checkout"
        subtitle="Payment gateways and dynamic weight-based shipping configurations."
        actions={
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Configs"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" /> Company Defaults
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Admin Charge (%)</Label>
                <Input
                  type="number"
                  value={data?.adminCharge || 0}
                  onChange={(e) => updateField("adminCharge", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Warehouse Pincode</Label>
                <Input
                  type="text"
                  value={shippingConfig?.warehousePincode || ""}
                  onChange={(e) => {
                    const newConfig = { ...shippingConfig, warehousePincode: e.target.value };
                    setShippingConfig(newConfig);
                  }}
                  onBlur={() => saveShippingConfig(shippingConfig)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              (Note: Delivery Fee and Min Order are now managed in the Shipping Configuration below.)
            </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Weight Slabs (Base Charges)</CardTitle>
            <div className="flex gap-2">
              {shippingConfig.weightSlabs.length === 0 && (
                <Button variant="outline" size="sm" onClick={seedSlabs}>Load Defaults</Button>
              )}
              <Button size="sm" className="gap-1.5" onClick={onAddSlab}>
                <Plus className="h-4 w-4" /> Add Slab
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {shippingConfig.weightSlabs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                No weight slabs defined. Flat rate surcharges will be used.
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 font-medium text-muted-foreground">
                    <tr>
                      <th className="p-3">Min Weight (kg)</th>
                      <th className="p-3">Max Weight (kg)</th>
                      <th className="p-3">Base Charge (₹)</th>
                      <th className="p-3 w-[100px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingConfig.weightSlabs.map((slab, i) => (
                      <tr key={i} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{slab.minWeight} kg</td>
                        <td className="p-3 font-medium">{slab.maxWeight} kg</td>
                        <td className="p-3 font-semibold text-primary">₹{slab.charge}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEditSlab(slab, i)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDeleteSlab(i)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              If an order's weight exceeds all slabs, the highest slab charge will be applied.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Distance Slabs (Added Charges)</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" className="gap-1.5" onClick={onAddDistanceSlab}>
                <Plus className="h-4 w-4" /> Add Distance Slab
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {shippingConfig.distanceSlabs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                No distance slabs defined. Distance charges are disabled.
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 font-medium text-muted-foreground">
                    <tr>
                      <th className="p-3">Min Distance (km)</th>
                      <th className="p-3">Max Distance (km)</th>
                      <th className="p-3">Distance Charge (₹)</th>
                      <th className="p-3 w-[100px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingConfig.distanceSlabs.map((slab, i) => (
                      <tr key={i} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{slab.minDistance} km</td>
                        <td className="p-3 font-medium">{slab.maxDistance} km</td>
                        <td className="p-3 font-semibold text-primary">₹{slab.charge}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEditDistanceSlab(slab, i)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDeleteDistanceSlab(i)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Added on top of Weight Slabs and Mode Surcharges.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Mode Surcharges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground -mt-2">
              Added on top of the base weight slab charge.
            </p>
            <div className="space-y-2">
              <Label>Air Surcharge (₹)</Label>
              <Input
                type="number"
                value={shippingConfig.modeSurcharges.air}
                onChange={(e) => handleModeChange('air', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Road/Surface Surcharge (₹)</Label>
              <Input
                type="number"
                value={shippingConfig.modeSurcharges.road}
                onChange={(e) => handleModeChange('road', e.target.value)}
              />
            </div>
            <div className="pt-2">
              <Button onClick={() => saveShippingConfig(shippingConfig)} disabled={savingShipping} className="w-full gap-2">
                {savingShipping ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Surcharges
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Free Delivery Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground -mt-2">
              Orders above these amounts will have zero shipping charges.
            </p>
            <div className="space-y-2">
              <Label>Air Threshold (₹)</Label>
              <Input
                type="number"
                placeholder="Disabled"
                value={shippingConfig.freeDeliveryThreshold.air || ''}
                onChange={(e) => handleThresholdChange('air', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Road Threshold (₹)</Label>
              <Input
                type="number"
                placeholder="Disabled"
                value={shippingConfig.freeDeliveryThreshold.road || ''}
                onChange={(e) => handleThresholdChange('road', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Global/Both Threshold (₹)</Label>
              <Input
                type="number"
                placeholder="Disabled"
                value={shippingConfig.freeDeliveryThreshold.both || ''}
                onChange={(e) => handleThresholdChange('both', e.target.value)}
              />
            </div>
            <div className="pt-2">
              <Button onClick={() => saveShippingConfig(shippingConfig)} disabled={savingShipping} className="w-full gap-2">
                {savingShipping ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Thresholds
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <FormDialog<WeightSlab>
        open={open}
        onOpenChange={setOpen}
        title={editingSlab ? "Edit Weight Slab" : "Add Weight Slab"}
        fields={slabFields}
        initialValues={editingSlab}
        defaultValues={{ minWeight: 0, maxWeight: 0, charge: 0 }}
        onSubmit={handleSlabSubmit}
      />

      <FormDialog<DistanceSlab>
        open={openDistance}
        onOpenChange={setOpenDistance}
        title={editingDistanceSlab ? "Edit Distance Slab" : "Add Distance Slab"}
        fields={distanceSlabFields}
        initialValues={editingDistanceSlab}
        defaultValues={{ minDistance: 0, maxDistance: 0, charge: 0 }}
        onSubmit={handleDistanceSlabSubmit}
      />
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
