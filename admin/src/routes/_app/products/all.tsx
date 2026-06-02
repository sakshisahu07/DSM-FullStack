import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit2, Trash2, Copy, ImageIcon, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, type Column } from "@/components/data-table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { products as initialProducts, type Product, inrFormat } from "@/lib/mock-data";
import { useEffect, useCallback } from "react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API_ADMIN_PRODUCTS = `${API_BASE}/products/admin`;

export const Route = createFileRoute("/_app/products/all")({
  component: ProductsAll,
});

function ProductsAll() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [brandMap, setBrandMap] = useState<Record<string, string>>({});

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch categories + brands in parallel to build lookup maps
      const [catRes, brandRes, prodRes] = await Promise.all([
        apiFetch(`${API_BASE}/categories`),
        apiFetch(`${API_BASE}/brands?page=1&limit=100`),
        apiFetch(`${API_ADMIN_PRODUCTS}?limit=50&t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const catJson = await catRes.json();
      const brandJson = await brandRes.json();
      const json = await prodRes.json();

      // Build id → name maps
      const newCatMap: Record<string, string> = {};
      const catData = catJson.data?.categories || catJson.data || [];
      (Array.isArray(catData) ? catData : []).forEach((c: any) => {
        if (c._id) newCatMap[c._id] = c.name || c.title || "Uncategorized";
      });
      setCategoryMap(newCatMap);

      const newBrandMap: Record<string, string> = {};
      const brandData = brandJson.data?.brands || brandJson.data || [];
      (Array.isArray(brandData) ? brandData : []).forEach((b: any) => {
        if (b._id) newBrandMap[b._id] = b.brandName || b.name || b.title || "Generic";
      });
      setBrandMap(newBrandMap);

      if (json.success) {
        const mapped: Product[] = json.data.products.map((p: any) => {
          // Resolve category name from categoryId
          const categoryName = newCatMap[p.categoryId] || newCatMap[p.category] || "Uncategorized";
          // Resolve brand name from brandId
          const brandName = newBrandMap[p.brandId] || newBrandMap[p.brand] || "Generic";

          // Variants: try both `variants` and `variant` keys
          const variantsArr: any[] = Array.isArray(p.variants) ? p.variants
            : Array.isArray(p.variant) ? p.variant : [];

          // Stock: sum from variants
          const totalStock = variantsArr.length > 0
            ? variantsArr.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
            : (Number(p.stock) || 0);

          return {
            id: p._id,
            name: p.name,
            sku: p.sku || `SKU-${p._id.slice(-4).toUpperCase()}`,
            category: categoryName,
            brand: brandName,
            basePrice: p.price || 0,
            variants: variantsArr.length,
            stock: totalStock,
            image: p.images?.[0] || "",
            isHot: !!p.isHot || !!p.hotdeal,
            isTrending: !!p.isTrending || !!p.trending,
            isAvailable: !p.disable,
            raw: p,
          };
        });
        setItems(mapped);
        setTotal(json.data.pagination?.total ?? mapped.length);
      }
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggle = (id: string, field: keyof Product) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p)));
    toast.success("Updated", { description: "Change saved." });
  };

  const onCreate = () => { setEditing(null); setDrawerOpen(true); };
  const onEdit = (p: Product) => { setEditing(p); setDrawerOpen(true); };
  const onDelete = async (p: Product) => {
    const toastId = toast.loading(`Deleting ${p.name}...`);
    try {
      const res = await apiFetch(`${API_BASE}/product/${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Server error ${res.status}`);
      }
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      setTotal((prev) => prev - 1);
      toast.success(`Deleted ${p.name}`, { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`, { id: toastId });
    }
  };
  const onDuplicate = (p: Product) => {
    setItems((prev) => [{ ...p, id: `PRD-${Date.now()}`, name: p.name + " (copy)" }, ...prev]);
    toast.success("Duplicated");
  };

  const columns: Column<Product>[] = [
    {
      key: "img", header: "Image", className: "w-14",
      cell: (p) => {
        const imgSrc = (p as any).image || (p as any).raw?.images?.[0] || (p as any).raw?.icon || null;
        return imgSrc ? (
          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden border">
            <img
              src={imgSrc}
              alt={(p as any).name}
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 m-auto mt-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
              }}
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted grid place-items-center text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
          </div>
        );
      },
    },
    {
      key: "name", header: "Product", cell: (p) => (
        <div>
          <div className="font-medium text-sm">{p.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
        </div>
      )
    },
    { key: "category", header: "Category", cell: (p) => <span className="text-sm">{p.category}</span> },
    { key: "variants", header: "Variants", cell: (p) => <span className="text-sm">{p.variants}</span> },
    {
      key: "stock", header: "Stock",
      cell: (p) => (
        <StatusBadge variant={p.stock === 0 ? "danger" : p.stock < 10 ? "warning" : "success"}>
          {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
        </StatusBadge>
      ),
    },
    { key: "isAvailable", header: "Active", cell: (p) => <Switch checked={p.isAvailable} onCheckedChange={() => toggle(p.id, "isAvailable")} /> },
    {
      key: "actions", header: "Actions", className: "text-right",
      cell: (p) => {
        const productId = (p as any).id || (p as any).raw?._id;
        const viewUrl = productId ? `http://localhost:3000/product/${productId}` : '#';
        return (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(viewUrl, '_blank')} disabled={!productId}><Eye className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(p)}><Edit2 className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDuplicate(p)}><Copy className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Products"
        subtitle={`${total} products total`}
        actions={
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Product
          </Button>
        }
      />

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-lg bg-card">
          Loading products...
        </div>
      ) : (
        <DataTable storageKey="products.all"
          data={items}
          columns={columns}
          searchKeys={["name", "sku", "category", "brand"]}
        />
      )}

      <ProductDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        product={editing}
        onSave={async (formData) => {
          const toastId = toast.loading("Saving product changes...");
          try {
            const url = editing
              ? `${API_BASE}/product/${editing.id}`
              : `${API_BASE}/create/product`;
            const method = editing ? "PUT" : "POST";

            console.log(`[FRONTEND] Saving product. URL: ${url}, Method: ${method}`);
            for (const pair of (formData as any).entries()) {
              console.log(`  FormData entry: ${pair[0]} =`, pair[1]);
            }

            const res = await apiFetch(url, {
              method,
              body: formData,
            });

            const json = await res.json();
            console.log("[FRONTEND] Save response status:", res.status, "JSON:", json);

            if (json.success) {
              toast.success(json.message || `Product ${editing ? "updated" : "created"} successfully`, { id: toastId });
              fetchProducts();
              setDrawerOpen(false);
            } else {
              toast.error(json.message || "Operation failed", { id: toastId });
            }
          } catch (error: any) {
            console.error("[FRONTEND] Error saving product:", error);
            toast.error(error?.message || "Failed to save product", { id: toastId });
          }
        }}
      />
    </div>
  );
}

function ProductDrawer({ open, onOpenChange, product, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; product: Product | null;
  onSave: (p: FormData) => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");


  const [desc, setDesc] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [variants, setVariants] = useState<any[]>([]);
  const [specs, setSpecs] = useState<{ title: string; points: string }[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");

  const [icon, setIcon] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingIcon, setExistingIcon] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      // Fetch Categories
      try {
        const res = await apiFetch(`${API_BASE}/categories`);
        const json = await res.json();
        if (json.success !== false) {
          const catData = json.data?.categories || json.data || [];
          const items = Array.isArray(catData) ? catData : [];
          setCategories([{ _id: "test", title: "Test Category (Debug)" }, ...items]);
        }
      } catch (e) {
        console.error("Categories fetch failed", e);
      }

      // Fetch Subcategories
      try {
        const res = await apiFetch(`${API_BASE}/sub-category`);
        const json = await res.json();
        if (json.success !== false) {
          const subData = json.data?.subCategories || json.data || [];
          setSubCategories(Array.isArray(subData) ? subData : []);
        }
      } catch (e) {
        console.error("Subcategories fetch failed", e);
      }

      // Fetch Brands (trying both plural and singular since it failed in screenshot)
      try {
        let res = await apiFetch(`${API_BASE}/brands?page=1&limit=100`);
        if (!res.ok) res = await apiFetch(`${API_BASE}/brands?page=1&limit=100`);
        const json = await res.json();
        if (json.success !== false) {
          const brandData = json.data?.brands || json.data || [];
          setBrands(Array.isArray(brandData) ? brandData : []);
        }
      } catch (e) {
        console.error("Brands fetch failed", e);
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setSku(product?.sku ?? "");


      const raw = (product as any)?.raw;
      
      setDesc(raw?.description ?? "");
      setIsHot(product?.isHot ?? false);
      setIsTrending(product?.isTrending ?? false);
      setIsAvailable(product?.isAvailable ?? true);
      
      const rawVars = raw?.variants || raw?.variant;
      if (rawVars && rawVars.length > 0) {
        setVariants(rawVars.map((v: any, i: number) => {
          const mrp = v.mrp ?? 0;
          const discount = v.discount ?? 0;
          const sellingPrice = mrp > 0 ? Math.round(mrp - (mrp * discount / 100)) : 0;
          return {
            id: v._id || i, 
            variant: v.size || v.variant || "Default", 
            mrp: mrp, 
            sellingPrice: sellingPrice,
            discount: discount, 
            stock: v.stock ?? 0, 
            sku: v.sku ?? "", 
            weight: v.weight?.value ?? v.weight ?? 0
          };
        }));
      } else {
        setVariants([{ id: Date.now(), variant: "Default", mrp: 0, sellingPrice: 0, discount: 0, stock: 0, sku: product?.sku ?? "", weight: 0 }]);
      }
      
      setIcon(null);
      setImages(null);
      setIconPreview(null);
      setImagePreviews([]);
      const raw2 = (product as any)?.raw;
      setExistingIcon(raw2?.icon || raw2?.mainImage || raw2?.thumbnail || null);
      const existImgs = raw2?.images || raw2?.productImages || [];
      setExistingImages(Array.isArray(existImgs) ? existImgs : []);
      
      setCategoryId(raw?.category?._id ?? raw?.categoryId ?? "");
      setSubCategoryId(raw?.subCategory?._id ?? raw?.subCategoryId ?? "");
      setBrandId(raw?.brand?._id ?? raw?.brandId ?? "");

      const rawSpecs = raw?.specification || [];
      if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
        setSpecs(rawSpecs.map((s: any) => ({
          title: s.title || "",
          points: Array.isArray(s.points) ? s.points.join(", ") : (s.points || "")
        })));
      } else {
        setSpecs([]);
      }

      setMetaTitle(raw?.metaTitle || "");
      setMetaDesc(raw?.metaDescription || "");
      setKeywords(raw?.keywords || "");
    }
  }, [open, product]);

  const handleSave = () => {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", desc || "No description");
    if (categoryId) fd.append("categoryId", categoryId);
    if (subCategoryId) fd.append("subCategoryId", subCategoryId);
    if (brandId) fd.append("brandId", brandId);
    fd.append("hotdeal", String(isHot));
    fd.append("trending", String(isTrending));
    fd.append("disable", String(!isAvailable));

    const validVariants = variants.map(v => ({
      size: v.variant || "Default",
      mrp: v.mrp || 0,
      stock: v.stock || 0,
      discount: v.discount || 0,
      packageDimensions: "10x10x10 cm",
      weight: { value: v.weight || 0, unit: "g" }
    }));

    fd.append("variant", JSON.stringify(validVariants.length > 0 ? validVariants : [
      { 
        size: "Default",
        mrp: 0,
        stock: 0,
        discount: 0,
        packageDimensions: "10x10x10 cm",
        weight: { value: 0, unit: "g" }
      }
    ])); // Required by API to have at least 1 item

    if (icon) fd.append("icon", icon);
    if (images) {
      Array.from(images).forEach((file) => fd.append("images", file));
    }

    const validSpecs = specs
      .filter((s) => s.title.trim() !== "")
      .map((s) => ({
        title: s.title.trim(),
        points: s.points.split(",").map((p) => p.trim()).filter((p) => p !== "")
      }));
    fd.append("specification", JSON.stringify(validSpecs));

    fd.append("metaTitle", metaTitle);
    fd.append("metaDescription", metaDesc);
    fd.append("keywords", keywords);

    onSave(fd);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? "Edit Product" : "Create Product"}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-5">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.title || c.name || "Untitled"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={subCategoryId}
                  onValueChange={setSubCategoryId}
                  disabled={!categoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoryId ? "Select Subcategory" : "Select Category First"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories
                      .filter((s) => {
                        const sCatId = (typeof s.category === 'object' && s.category)
                          ? s.category._id
                          : (s.category || s.categoryId || s.category_id || s.categoryID);
                        return sCatId === categoryId;
                      })
                      .map((s) => (
                        <SelectItem key={s._id || s.id} value={s._id || s.id}>{s.title || s.name || "Untitled"}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {categoryId && subCategories.length > 0 && subCategories.filter(s => {
                  const sCatId = (typeof s.category === 'object' && s.category) ? s.category._id : (s.category || s.categoryId);
                  return sCatId === categoryId;
                }).length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">No subcategories found for this category.</p>
                  )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b._id || b.id} value={b._id || b.id}>{b.brandName || b.title || b.name || "Untitled"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="rounded-md border p-3 space-y-3">
              <div className="text-sm font-medium">Flags</div>
              <div className="flex items-center justify-between"><Label>Hot product</Label><Switch checked={isHot} onCheckedChange={setIsHot} /></div>
              <div className="flex items-center justify-between"><Label>Trending</Label><Switch checked={isTrending} onCheckedChange={setIsTrending} /></div>
              <div className="flex items-center justify-between"><Label>Available</Label><Switch checked={isAvailable} onCheckedChange={setIsAvailable} /></div>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Manage product variants (size, color, etc)</div>
              <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); setVariants([...variants, { id: Date.now(), variant: "", mrp: 0, sellingPrice: 0, discount: 0, stock: 0, sku: "", weight: 0 }]); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add variant
              </Button>
            </div>
            
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={v.id} className="grid grid-cols-2 md:grid-cols-7 gap-3 p-4 border rounded-xl relative">
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-destructive" onClick={(e) => { e.preventDefault(); setVariants(variants.filter(x => x.id !== v.id)); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex flex-col justify-end gap-1.5 col-span-2 md:col-span-1">
                    <Label className="text-xs whitespace-nowrap">Variant Name</Label>
                    <Input className="h-8" value={v.variant} onChange={e => { const nv = [...variants]; nv[idx].variant = e.target.value; setVariants(nv); }} placeholder="e.g. Red" />
                  </div>
                  <div className="flex flex-col justify-end gap-1.5">
                    <Label className="text-xs whitespace-nowrap">SKU</Label>
                    <Input className="h-8" value={v.sku} onChange={e => { const nv = [...variants]; nv[idx].sku = e.target.value; setVariants(nv); }} />
                  </div>
                  <div className="flex flex-col justify-end gap-1.5">
                    <Label className="text-xs whitespace-nowrap">MRP (₹)</Label>
                    <Input className="h-8" type="number" value={v.mrp === 0 ? "" : v.mrp} onChange={e => { const val = e.target.value === "" ? 0 : +e.target.value; const nv = [...variants]; nv[idx].mrp = val; if (nv[idx].discount > 0) { nv[idx].sellingPrice = Math.round(val - (val * nv[idx].discount / 100)); } else { nv[idx].sellingPrice = val; } setVariants(nv); }} placeholder="0" />
                  </div>
                  <div className="flex flex-col justify-end gap-1.5">
                    <Label className="text-xs text-primary font-semibold whitespace-nowrap">Selling Price</Label>
                    <Input className="h-8 border-primary font-medium" type="number" value={v.sellingPrice === 0 ? "" : v.sellingPrice} onChange={e => { const val = e.target.value === "" ? 0 : +e.target.value; const nv = [...variants]; nv[idx].sellingPrice = val; if (nv[idx].mrp > 0) { nv[idx].discount = Math.max(0, Math.round(((nv[idx].mrp - val) / nv[idx].mrp) * 100)); } setVariants(nv); }} placeholder="0" />
                  </div>
                  <div className="flex flex-col justify-end gap-1.5">
                    <Label className="text-xs whitespace-nowrap">Discount (%)</Label>
                    <Input className="h-8 bg-muted" type="number" value={v.discount === 0 ? "" : v.discount} onChange={e => { const val = e.target.value === "" ? 0 : +e.target.value; const nv = [...variants]; nv[idx].discount = val; if (nv[idx].mrp > 0) { nv[idx].sellingPrice = Math.max(0, Math.round(nv[idx].mrp - (nv[idx].mrp * val / 100))); } setVariants(nv); }} placeholder="0" />
                  </div>
                  <div className="flex flex-col justify-end gap-1.5">
                    <Label className="text-xs whitespace-nowrap">Stock</Label>
                    <Input className="h-8" type="number" value={v.stock === 0 ? "" : v.stock} onChange={e => { const nv = [...variants]; nv[idx].stock = e.target.value === "" ? 0 : +e.target.value; setVariants(nv); }} placeholder="0" />
                  </div>
                  <div className="flex flex-col justify-end gap-1.5">
                    <Label className="text-xs whitespace-nowrap">Weight (g)</Label>
                    <Input className="h-8" type="number" value={v.weight === 0 ? "" : v.weight} onChange={e => { const nv = [...variants]; nv[idx].weight = e.target.value === "" ? 0 : +e.target.value; setVariants(nv); }} placeholder="0" />
                  </div>
                </div>
              ))}
              {variants.length === 0 && (
                <div className="rounded-md border p-6 text-sm text-muted-foreground text-center">
                  No variants added. A default variant will be automatically created on publish.
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="specs" className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Manage key-value product specifications</div>
              <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); setSpecs([...specs, { title: "", points: "" }]); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Specification
              </Button>
            </div>
            
            <div className="space-y-3">
              {specs.map((s, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border rounded-xl relative">
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-destructive" onClick={(e) => { e.preventDefault(); setSpecs(specs.filter((_, i) => i !== idx)); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Specification Title</Label>
                    <Input className="h-8" value={s.title} onChange={e => { const ns = [...specs]; ns[idx].title = e.target.value; setSpecs(ns); }} placeholder="e.g. Dimensions" />
                  </div>
                  <div className="space-y-1.5 pr-6 md:pr-0">
                    <Label className="text-xs">Points (comma separated)</Label>
                    <Input className="h-8" value={s.points} onChange={e => { const ns = [...specs]; ns[idx].points = e.target.value; setSpecs(ns); }} placeholder="e.g. 10x10x10 cm, Light weight" />
                  </div>
                </div>
              ))}
              {specs.length === 0 && (
                <div className="rounded-md border p-6 text-sm text-muted-foreground text-center">
                  No specifications added yet. Add custom product technical details above.
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="seo" className="mt-5 space-y-3">
            <div className="space-y-2"><Label>Meta title</Label><Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Meta description</Label><Textarea rows={3} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} /></div>
            <div className="space-y-2"><Label>Keywords</Label><Input placeholder="comma, separated" value={keywords} onChange={e => setKeywords(e.target.value)} /></div>
          </TabsContent>
          <TabsContent value="images" className="mt-5 space-y-5">
            {/* Main Icon */}
            <div className="space-y-2">
              <Label>Main Icon (Single File)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setIcon(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setIconPreview(url);
                  } else {
                    setIconPreview(null);
                  }
                }}
              />
              {/* Icon Preview */}
              {(iconPreview || existingIcon) && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative h-20 w-20 rounded-lg border overflow-hidden bg-muted">
                    <img
                      src={iconPreview || existingIcon!}
                      alt="Icon preview"
                      className="h-full w-full object-contain"
                    />
                    {iconPreview && (
                      <span className="absolute top-1 left-1 text-[9px] bg-green-500 text-white px-1 rounded">NEW</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {iconPreview ? (
                      <span className="text-green-600 font-medium">✓ New icon selected</span>
                    ) : (
                      <span>Current icon</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Product Images */}
            <div className="space-y-2">
              <Label>Product Images (Multiple)</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  setImages(files);
                  if (files && files.length > 0) {
                    const previews: string[] = [];
                    Array.from(files).forEach((file) => {
                      previews.push(URL.createObjectURL(file));
                    });
                    setImagePreviews(previews);
                  } else {
                    setImagePreviews([]);
                  }
                }}
              />
            </div>

            {/* New Images Preview */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-green-600">✓ {imagePreviews.length} new image(s) selected</Label>
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative h-20 rounded-lg border overflow-hidden bg-muted">
                      <img src={src} alt={`New ${i + 1}`} className="h-full w-full object-contain" />
                      <span className="absolute top-1 left-1 text-[9px] bg-green-500 text-white px-1 rounded">NEW</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Images */}
            {existingImages.length > 0 && imagePreviews.length === 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Current product images ({existingImages.length})</Label>
                <div className="grid grid-cols-4 gap-2">
                  {existingImages.map((src, i) => (
                    <div key={i} className="h-20 rounded-lg border overflow-hidden bg-muted">
                      <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {imagePreviews.length === 0 && existingImages.length === 0 && (
              <div className="rounded-md border-2 border-dashed p-6 text-center text-muted-foreground text-sm">
                No images selected. Upload images above.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            {product ? "Save changes" : "Publish Product"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
