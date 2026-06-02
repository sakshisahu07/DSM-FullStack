import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Package, Pencil, Trash2, Loader2, Upload, 
  ChevronRight, X, Info, Layers, Image as ImageIcon,
  CheckCircle2, AlertCircle, Check, ChevronDown
} from "lucide-react";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { inrFormat } from "@/lib/mock-data";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";

export const Route = createFileRoute("/_app/marketing/combo-offers")({
  component: ComboOffersPage,
});

interface ComboItem {
  variantId: string;
  quantity: number;
  variant?: any;
  productName?: string;
}

interface Feature {
  title: string;
  points: string[];
}

interface Spec {
  title: string;
  points: string[];
}

interface Combo {
  _id: string;
  name: string;
  sku: string;
  slug: string;
  comboPrice: number;
  totalMrp: number;
  discountAmount: number;
  stock: number;
  disable: boolean;
  icon?: string;
  banner?: string;
  images: string[];
  items: ComboItem[];
  codeTab: string[];
  applications: string[];
  pinConfiguration: string[];
  keyFeatures: Feature[];
  specification: Spec[];
  createdAt: string;
  countries?: string[];
  states?: string[];
  cities?: string[];
  pincodes?: string[];
  categories?: any[];
  subCategories?: any[];
  brands?: any[];
}

function ComboOffersPage() {
  const [items, setItems] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Combo | null>(null);

  const fetchCombos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/combo/admin`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data.combos || []);
      }
    } catch (err) {
      toast.error("Failed to load combos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  const toggleStatus = async (combo: Combo) => {
    try {
      const res = await apiFetch(`${API_BASE}/combo/${combo._id}/toggle-disable`, {
        method: "PATCH",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Status updated");
        setItems((p) => p.map((x) => x._id === combo._id ? { ...x, disable: !x.disable } : x));
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this combo?")) return;
    try {
      const res = await apiFetch(`${API_BASE}/combo/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Combo deleted");
        setItems((p) => p.filter((x) => x._id !== id));
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting combo");
    }
  };

  const onCreate = () => { setEditing(null); setDrawerOpen(true); };
  const onEdit = (c: Combo) => { setEditing(c); setDrawerOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Combo Offers"
        subtitle="Manage product bundles and marketing combos."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> New combo</Button>}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 h-64 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-20 text-center space-y-4">
          <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <div className="text-muted-foreground">No combo offers found. Create your first bundle to boost sales.</div>
          <Button variant="outline" onClick={onCreate}>Create Combo</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => {
            const save = c.totalMrp - c.comboPrice;
            const pct = Math.round((save / c.totalMrp) * 100);
            return (
              <Card key={c._id} className="p-5 flex flex-col group hover:shadow-lg transition-all border-l-4 border-l-primary/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center overflow-hidden border">
                    {c.icon ? (
                      <img src={c.icon} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {save > 0 && <Badge className="bg-success text-success-foreground font-bold italic">SAVE {pct}%</Badge>}
                    <Switch checked={!c.disable} onCheckedChange={() => toggleStatus(c)} />
                  </div>
                </div>
                <h3 className="font-bold text-lg line-clamp-1">{c.name}</h3>
                <div className="text-xs text-muted-foreground font-mono mb-3 uppercase tracking-tighter">SKU: {c.sku}</div>
                
                <div className="flex-1 space-y-2 mb-4">
                   <div className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Includes {c.items?.length || 0} items
                   </div>
                   <div className="flex flex-wrap gap-1">
                      {c.items?.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0 font-normal opacity-80">
                           {item.variant?.product?.name || item.productName || "Product"} (x{item.quantity})
                        </Badge>
                      ))}
                      {c.items?.length > 3 && <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{c.items.length - 3} more</Badge>}
                   </div>
                </div>

                <Separator className="mb-4" />

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-black text-primary">{inrFormat(c.comboPrice)}</div>
                    <div className="text-xs text-muted-foreground line-through decoration-destructive/50">{inrFormat(c.totalMrp)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-9 w-9 bg-muted/50" onClick={() => onEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive bg-destructive/10 hover:bg-destructive hover:text-white" onClick={() => onDelete(c._id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ComboDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        combo={editing}
        onSave={() => {
          setDrawerOpen(false);
          fetchCombos();
        }}
      />
    </div>
  );
}

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

// Gorgeous, premium, optimized multi-select dropdown matching shadcn/radix theme
function MultiSelectDropdown({ label, options, selected, onChange, placeholder = "Select options..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleOption = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(x => x !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const filtered = options.filter(opt => 
    opt.label?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2 relative">
      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</Label>
      <div 
        className="min-h-10 w-full rounded-xl border bg-card/50 backdrop-blur-md border-border/80 px-3 py-2 text-sm ring-offset-background cursor-pointer flex flex-wrap gap-1.5 items-center justify-between shadow-sm hover:border-primary/50 transition-all select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 pr-4">
          {selected.length === 0 ? (
            <span className="text-muted-foreground text-xs">{placeholder}</span>
          ) : (
            selected.map(val => {
              const labelText = options.find(o => o.value === val)?.label || val;
              return (
                <Badge key={val} variant="secondary" className="text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 bg-muted/80 text-foreground border">
                  {labelText}
                  <X 
                    className="h-3 w-3 hover:text-destructive transition-colors cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(selected.filter(x => x !== val));
                    }} 
                  />
                </Badge>
              );
            })
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 w-full rounded-xl border bg-popover/95 backdrop-blur-lg text-popover-foreground shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden flex flex-col max-h-60 border-border/80">
            <div className="p-2 border-b border-border/80 bg-muted/30">
              <Input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search..." 
                className="h-8 text-xs rounded-lg" 
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <ScrollArea className="flex-1 max-h-48 overflow-y-auto">
              <div className="p-1.5 space-y-0.5">
                {filtered.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground text-center">No options found</div>
                ) : (
                  filtered.map(opt => {
                    const isChecked = selected.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(opt.value);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isChecked && <Check className="h-3.5 w-3.5 text-primary stroke-[3px]" />}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

function ComboDrawer({ open, onOpenChange, combo, onSave }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  combo: Combo | null;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);
  
  // Basic Info
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [stock, setStock] = useState("");
  
  // Dynamic Lists
  const [items, setItems] = useState<ComboItem[]>([{ variantId: "", quantity: 1 }]);
  const [codeTab, setCodeTab] = useState<string[]>([""]);
  const [applications, setApplications] = useState<string[]>([""]);
  const [pinConfiguration, setPinConfiguration] = useState<string[]>([""]);
  const [keyFeatures, setKeyFeatures] = useState<Feature[]>([{ title: "", points: [""] }]);
  const [specification, setSpecification] = useState<Spec[]>([{ title: "", points: [""] }]);
  
  // Custom Selection States (Categories, Subcategories, Brands)
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // List arrays fetched on mount
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [subCategoriesList, setSubCategoriesList] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [countriesList, setCountriesList] = useState<any[]>([]);

  // Pincode entry UI helpers
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeMap, setPincodeMap] = useState<Record<string, string>>({});

  // Location
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);

  // Media
  const [icon, setIcon] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState({ icon: "", banner: "", images: [] as string[] });

  // Load selection list data on Sheet open
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [catRes, subRes, brandRes, countryRes] = await Promise.all([
          apiFetch(`${API_BASE}/categories?limit=150`),
          apiFetch(`${API_BASE}/sub-category`),
          apiFetch(`${API_BASE}/brands`),
          apiFetch(`${API_BASE}/countries?limit=250`)
        ]);
        
        const [catJson, subJson, brandJson, countryJson] = await Promise.all([
          catRes.json(),
          subRes.json(),
          brandRes.json(),
          countryRes.json()
        ]);
        
        if (catJson.success) {
          setCategoriesList(catJson.data?.categories || catJson.data || []);
        }
        if (subJson.success) {
          setSubCategoriesList(subJson.data?.subcategories || subJson.data || []);
        }
        if (brandJson.success) {
          setBrandsList(brandJson.data?.brands || brandJson.data || []);
        }
        if (countryJson.success) {
          setCountriesList(countryJson.data?.data || countryJson.data || []);
        }
      } catch (err) {
        console.error("Failed to load select options:", err);
      }
    };
    if (open) {
      loadDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (combo) {
        setName(combo.name);
        setSku(combo.sku);
        setComboPrice(String(combo.comboPrice));
        setStock(String(combo.stock));
        setItems(combo.items?.map(i => ({ variantId: i.variantId, quantity: i.quantity })) || [{ variantId: "", quantity: 1 }]);
        setCodeTab(combo.codeTab?.length ? combo.codeTab : [""]);
        setApplications(combo.applications?.length ? combo.applications : [""]);
        setPinConfiguration(combo.pinConfiguration?.length ? combo.pinConfiguration : [""]);
        setKeyFeatures(combo.keyFeatures?.map(f => ({ title: f.title, points: f.points?.length ? f.points : [""] })) || [{ title: "", points: [""] }]);
        setSpecification(combo.specification?.map(s => ({ title: s.title, points: s.points?.length ? s.points : [""] })) || [{ title: "", points: [""] }]);
        setCountries(combo.countries?.map((c: any) => typeof c === 'string' ? c : c._id) || []);
        setStates(combo.states?.map((s: any) => typeof s === 'string' ? s : s._id) || []);
        setCities(combo.cities?.map((c: any) => typeof c === 'string' ? c : c._id) || []);
        setPincodes(combo.pincodes?.map((p: any) => typeof p === 'string' ? p : p._id) || []);
        setPreviews({ icon: combo.icon || "", banner: combo.banner || "", images: combo.images || [] });
        
        // Populate custom selection values
        setCategories(combo.categories?.map((c: any) => typeof c === 'string' ? c : c._id) || []);
        setSubCategories(combo.subCategories?.map((s: any) => typeof s === 'string' ? s : s._id) || []);
        setBrands(combo.brands?.map((b: any) => typeof b === 'string' ? b : b._id) || []);
      } else {
        setName(""); setSku(""); setComboPrice(""); setStock("10");
        setItems([{ variantId: "", quantity: 1 }]);
        setCodeTab([""]); setApplications([""]); setPinConfiguration([""]);
        setKeyFeatures([{ title: "", points: [""] }]);
        setSpecification([{ title: "", points: [""] }]);
        setCountries([]); setStates([]); setCities([]); setPincodes([]);
        setPreviews({ icon: "", banner: "", images: [] });
        
        // Reset selections
        setCategories([]);
        setSubCategories([]);
        setBrands([]);
      }
      setIcon(null); setBanner(null); setImages([]);
    }
  }, [open, combo]);

  // Load pincode details (human-readable codes) for existing pincodes when editing a combo
  useEffect(() => {
    if (open && combo && combo.pincodes?.length) {
      const fetchPincodeDetails = async () => {
        const uniqueIds = (combo.pincodes || []).map((p: any) => typeof p === 'string' ? p : p._id);
        const newMap = { ...pincodeMap };
        let hasUpdated = false;
        await Promise.all(
          uniqueIds.map(async (id) => {
            if (newMap[id]) return;
            try {
              const res = await apiFetch(`${API_BASE}/pincode/${id}`);
              const json = await res.json();
              if (json.success && json.data) {
                newMap[id] = json.data.code;
                hasUpdated = true;
              } else if (json.code) {
                newMap[id] = json.code;
                hasUpdated = true;
              }
            } catch (err) {
              console.error("Error fetching pincode:", id, err);
            }
          })
        );
        if (hasUpdated) {
          setPincodeMap(pincodeMap => ({ ...pincodeMap, ...newMap }));
        }
      };
      fetchPincodeDetails();
    }
  }, [open, combo]);

  const handleAddPincode = async () => {
    const trimmed = pincodeInput.trim();
    if (!trimmed) return;
    
    // Check format (digits only, e.g. 6-digit Indian PIN or flexible digits)
    if (!/^\d+$/.test(trimmed)) {
      toast.error("Please enter a valid numeric pincode");
      return;
    }
    
    try {
      const res = await apiFetch(`${API_BASE}/pincode/all?code=${trimmed}`);
      if (!res.ok) {
        toast.error(`Pincode lookup returned server status ${res.status}`);
        return;
      }
      const json = await res.json();
      
      const pinObj = json.data?.data?.[0] || json.data?.[0];
      if (pinObj && pinObj._id) {
        if (pincodes.includes(pinObj._id)) {
          toast.warning("Pincode already added");
        } else {
          setPincodes([...pincodes, pinObj._id]);
          setPincodeMap(prev => ({ ...prev, [pinObj._id]: trimmed }));
          toast.success(`Pincode ${trimmed} added successfully`);
        }
        setPincodeInput("");
      } else {
        toast.error(`Pincode ${trimmed} not found in database. Please create it first.`);
      }
    } catch (err) {
      toast.error("Failed to resolve pincode");
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    // ─── FRONT-END VALIDATION ─────────────────────────────────
    if (!name.trim()) {
      toast.error("Combo Name is required");
      return;
    }
    
    if (!sku.trim()) {
      toast.error("SKU is required");
      return;
    }

    const parsedPrice = parseFloat(comboPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid Combo Price (greater than 0)");
      return;
    }

    const validItems = items.filter(i => i.variantId.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one item with a valid Variant ID");
      return;
    }

    const hexPattern = /^[0-9a-fA-F]{24}$/;
    for (let i = 0; i < validItems.length; i++) {
      if (!hexPattern.test(validItems[i].variantId.trim())) {
        toast.error(`Variant ID at Item #${i + 1} is not a valid 24-character hex ID`);
        return;
      }
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sku", sku);
      formData.append("comboPrice", comboPrice);
      formData.append("stock", stock);
      
      // Stringify complex arrays as the API expects them as JSON text
      formData.append("items", JSON.stringify(items.filter(i => i.variantId)));
      formData.append("codeTab", JSON.stringify(codeTab.filter(Boolean)));
      formData.append("applications", JSON.stringify(applications.filter(Boolean)));
      formData.append("pinConfiguration", JSON.stringify(pinConfiguration.filter(Boolean)));
      formData.append("keyFeatures", JSON.stringify(keyFeatures.filter(f => f.title)));
      formData.append("specification", JSON.stringify(specification.filter(s => s.title)));
      
      formData.append("countries", JSON.stringify(countries));
      formData.append("states", JSON.stringify(states));
      formData.append("cities", JSON.stringify(cities));
      formData.append("pincodes", JSON.stringify(pincodes));

      // Append multi-select categories, subcategories, and brands
      formData.append("categories", JSON.stringify(categories));
      formData.append("subCategories", JSON.stringify(subCategories));
      formData.append("brands", JSON.stringify(brands));

      if (icon) formData.append("icon", icon);
      if (banner) formData.append("banner", banner);
      images.forEach(img => formData.append("images", img));

      const url = combo ? `${API_BASE}/combo/${combo._id}` : `${API_BASE}/combo`;
      const method = combo ? "PUT" : "POST";

      const res = await apiFetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        toast.success(combo ? "Combo updated successfully" : "Combo created successfully");
        onSave();
      } else {
        toast.error(json.message || "Operation failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl p-0 overflow-hidden flex flex-col">
        <SheetHeader className="p-6 pb-2 border-b">
          <SheetTitle>{combo ? "Edit Combo Offer" : "Create New Combo"}</SheetTitle>
          <SheetDescription>Configure bundle products, pricing, and technical details.</SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <Tabs defaultValue="basic" className="p-6 pt-2">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="gap-1.5"><Info className="h-3.5 w-3.5" /> Info</TabsTrigger>
              <TabsTrigger value="items" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> Items</TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Details</TabsTrigger>
              <TabsTrigger value="media" className="gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Media</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-0 mt-0">
              <div className="grid gap-2">
                <Label>Combo Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robotics Starter Kit" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>SKU *</Label>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="CB-001" />
                </div>
                <div className="grid gap-2">
                  <Label>Stock *</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="20" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Combo Price (₹) *</Label>
                <Input type="number" value={comboPrice} onChange={(e) => setComboPrice(e.target.value)} placeholder="5000" />
              </div>

              {/* Dynamic Categories, Subcategories, and Brands Multi-Select Dropdowns */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <MultiSelectDropdown
                  label="Categories"
                  options={categoriesList.map(c => ({ value: c._id, label: c.title || c.name }))}
                  selected={categories}
                  onChange={setCategories}
                  placeholder="Select categories for this combo..."
                />
                
                <MultiSelectDropdown
                  label="Subcategories"
                  options={subCategoriesList.map(s => ({ value: s._id, label: s.title || s.name }))}
                  selected={subCategories}
                  onChange={setSubCategories}
                  placeholder="Select subcategories for this combo..."
                />

                <MultiSelectDropdown
                  label="Brands"
                  options={brandsList.map(b => ({ value: b._id, label: b.brandName || b.title || b.name }))}
                  selected={brands}
                  onChange={setBrands}
                  placeholder="Select brands for this combo..."
                />
              </div>

              <Separator className="my-4" />
              <div className="space-y-4">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Location Restrictions (Optional)</Label>
                <div className="text-[10px] bg-muted/50 p-3 rounded-lg border border-dashed text-muted-foreground">
                   Restrict this combo to specific regions. Leave empty for nationwide availability.
                </div>
                
                {/* Country Multi-Select Dropdown */}
                <div className="pt-1">
                  <MultiSelectDropdown
                    label="Allowed Countries"
                    options={countriesList.map(c => ({ value: c._id, label: c.name }))}
                    selected={countries}
                    onChange={setCountries}
                    placeholder="Select restricted countries..."
                  />
                </div>

                {/* Interactive Pincode Tag Entry */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Allowed Pincodes</Label>
                  <div className="flex gap-2">
                    <Input
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="Type a pincode and press Enter (e.g. 462022)"
                      className="h-10 text-xs rounded-xl"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          await handleAddPincode();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddPincode}
                      className="h-10 px-4 text-xs font-semibold rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Selected Pincodes Badges Container */}
                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto p-2 border rounded-xl bg-muted/20 border-border/80">
                    {pincodes.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/75 px-1.5 py-0.5">No pincodes added yet. Nationwide availability.</span>
                    ) : (
                      pincodes.map(id => {
                        const code = pincodeMap[id] || id;
                        return (
                          <Badge key={id} variant="secondary" className="text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 bg-muted/80 text-foreground border border-border/80">
                            {code}
                            <X 
                              className="h-3 w-3 hover:text-destructive transition-colors cursor-pointer" 
                              onClick={() => setPincodes(pincodes.filter(x => x !== id))}
                            />
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 pt-0 mt-0">
               <div className="flex items-center justify-between">
                 <Label>Bundle Items</Label>
                 <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { variantId: "", quantity: 1 }])}>
                   Add Item
                 </Button>
               </div>
               <div className="space-y-3">
                 {items.map((item, idx) => (
                   <div key={idx} className="flex gap-2 items-end border p-3 rounded-lg bg-muted/30 relative group">
                      <div className="flex-1 space-y-1.5">
                         <Label className="text-[10px]">Variant ID *</Label>
                         <Input value={item.variantId} onChange={(e) => {
                           const n = [...items]; n[idx].variantId = e.target.value; setItems(n);
                         }} placeholder="Paste variant ID..." className="h-8 text-xs" />
                      </div>
                      <div className="w-20 space-y-1.5">
                         <Label className="text-[10px]">Qty *</Label>
                         <Input type="number" value={item.quantity} onChange={(e) => {
                           const n = [...items]; n[idx].quantity = parseInt(e.target.value) || 1; setItems(n);
                         }} className="h-8 text-xs" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                        <X className="h-4 w-4" />
                      </Button>
                   </div>
                 ))}
               </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 pt-0 mt-0">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold">Key Features</Label>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setKeyFeatures([...keyFeatures, { title: "", points: [""] }])}>Add Group</Button>
                  </div>
                  {keyFeatures.map((kf, i) => (
                    <div key={i} className="space-y-3 border p-3 rounded-lg relative group">
                       <Input value={kf.title} onChange={(e) => {
                         const n = [...keyFeatures]; n[i].title = e.target.value; setKeyFeatures(n);
                       }} placeholder="Feature Title (e.g. Hardware)" className="font-semibold" />
                       <div className="space-y-2 pl-4 border-l-2">
                          {kf.points.map((p, pi) => (
                            <div key={pi} className="flex gap-2 items-center">
                               <Input value={p} onChange={(e) => {
                                 const n = [...keyFeatures]; n[i].points[pi] = e.target.value; setKeyFeatures(n);
                               }} placeholder="Point details..." className="h-8 text-sm" />
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                 const n = [...keyFeatures]; n[i].points = n[i].points.filter((_, idx) => idx !== pi); setKeyFeatures(n);
                               }}><X className="h-3 w-3" /></Button>
                            </div>
                          ))}
                          <Button variant="link" size="sm" className="h-6 text-[10px] p-0" onClick={() => {
                            const n = [...keyFeatures]; n[i].points.push(""); setKeyFeatures(n);
                          }}>+ Add Point</Button>
                       </div>
                       <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => setKeyFeatures(keyFeatures.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
               </div>

               <Separator />

               <div className="space-y-2">
                  <Label>Other Details (One per line)</Label>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label className="text-[10px]">Applications</Label>
                        <Textarea value={applications.join("\n")} onChange={(e) => setApplications(e.target.value.split("\n"))} placeholder="Usage A\nUsage B" className="text-xs h-24" />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-[10px]">Pin Config</Label>
                        <Textarea value={pinConfiguration.join("\n")} onChange={(e) => setPinConfiguration(e.target.value.split("\n"))} placeholder="Pin 1: VCC\nPin 2: GND" className="text-xs h-24" />
                     </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 pt-0 mt-0">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Icon (1:1)</Label>
                     <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg border bg-muted grid place-items-center overflow-hidden shrink-0">
                           {previews.icon ? <img src={previews.icon} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <Label htmlFor="icon-up" className="flex-1 h-14 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted grid place-items-center text-[10px] text-muted-foreground px-2 text-center">
                           {icon ? icon.name : "Change Icon"}
                           <input id="icon-up" type="file" className="hidden" accept="image/*" onChange={(e) => {
                             const f = e.target.files?.[0]; if(f) { setIcon(f); setPreviews({...previews, icon: URL.createObjectURL(f)}); }
                           }} />
                        </Label>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label>Banner (Landscape)</Label>
                     <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg border bg-muted grid place-items-center overflow-hidden shrink-0">
                           {previews.banner ? <img src={previews.banner} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <Label htmlFor="banner-up" className="flex-1 h-14 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted grid place-items-center text-[10px] text-muted-foreground px-2 text-center">
                           {banner ? banner.name : "Change Banner"}
                           <input id="banner-up" type="file" className="hidden" accept="image/*" onChange={(e) => {
                             const f = e.target.files?.[0]; if(f) { setBanner(f); setPreviews({...previews, banner: URL.createObjectURL(f)}); }
                           }} />
                        </Label>
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                     {previews.images.map((img, i) => (
                        <div key={i} className="h-16 w-16 rounded border relative overflow-hidden group">
                           <img src={img} className="h-full w-full object-cover" />
                           <Button variant="destructive" size="icon" className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-80 rounded-none" onClick={() => setPreviews({...previews, images: previews.images.filter((_, idx) => idx !== i)})}>
                             <X className="h-4 w-4" />
                           </Button>
                        </div>
                      ))}
                  </div>
                  <Label htmlFor="gallery-up" className="w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
                     <Upload className="h-5 w-5" />
                     {images.length ? `${images.length} files selected` : "Upload Gallery Images"}
                     <input id="gallery-up" type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setImages([...images, ...files]);
                        setPreviews({...previews, images: [...previews.images, ...files.map(f => URL.createObjectURL(f))]});
                     }} />
                  </Label>
               </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <SheetFooter className="p-6 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={saving} onClick={handleSubmit} className="min-w-[120px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : combo ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {combo ? "Save Changes" : "Create Combo"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}

function Textarea({ value, onChange, placeholder, className }: TextareaProps) {
  return (
    <textarea 
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}
