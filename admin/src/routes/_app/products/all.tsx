import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit2, Trash2, Copy, ImageIcon } from "lucide-react";
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
  const onDelete = (p: Product) => {
    setItems((prev) => prev.filter((x) => x.id !== p.id));
    toast.success(`Deleted ${p.name}`);
  };
  const onDuplicate = (p: Product) => {
    setItems((prev) => [{ ...p, id: `PRD-${Date.now()}`, name: p.name + " (copy)" }, ...prev]);
    toast.success("Duplicated");
  };

  const columns: Column<Product>[] = [
    {
      key: "img", header: "Image", className: "w-14",
      cell: () => (
        <div className="h-10 w-10 rounded-md bg-muted grid place-items-center text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
        </div>
      ),
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
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(p)}><Edit2 className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDuplicate(p)}><Copy className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
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

  const [icon, setIcon] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);

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
        setVariants(rawVars.map((v: any, i: number) => ({
          id: v._id || i, 
          variant: v.size || v.variant || "Default", 
          mrp: v.mrp ?? 0, 
          discount: v.discount ?? 0, 
          stock: v.stock ?? 0, 
          sku: v.sku ?? "", 
          weight: v.weight?.value ?? v.weight ?? 0
        })));
      } else {
        setVariants([{ id: Date.now(), variant: "Default", mrp: 0, discount: 0, stock: 0, sku: product?.sku ?? "", weight: 0 }]);
      }
      
      setIcon(null);
      setImages(null);
      
      setCategoryId(raw?.category?._id ?? raw?.categoryId ?? "");
      setSubCategoryId(raw?.subCategory?._id ?? raw?.subCategoryId ?? "");
      setBrandId(raw?.brand?._id ?? raw?.brandId ?? "");
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
              <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); setVariants([...variants, { id: Date.now(), variant: "", mrp: 0, discount: 0, stock: 0, sku: "", weight: 0 }]); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add variant
              </Button>
            </div>
            
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={v.id} className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 border rounded-xl relative">
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-destructive" onClick={(e) => { e.preventDefault(); setVariants(variants.filter(x => x.id !== v.id)); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <Label className="text-xs">Variant Name</Label>
                    <Input className="h-8" value={v.variant} onChange={e => { const nv = [...variants]; nv[idx].variant = e.target.value; setVariants(nv); }} placeholder="e.g. Red" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">SKU</Label>
                    <Input className="h-8" value={v.sku} onChange={e => { const nv = [...variants]; nv[idx].sku = e.target.value; setVariants(nv); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">MRP (₹)</Label>
                    <Input className="h-8" type="number" value={v.mrp} onChange={e => { const nv = [...variants]; nv[idx].mrp = +e.target.value; setVariants(nv); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Discount (%)</Label>
                    <Input className="h-8" type="number" value={v.discount} onChange={e => { const nv = [...variants]; nv[idx].discount = +e.target.value; setVariants(nv); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Stock</Label>
                    <Input className="h-8" type="number" value={v.stock} onChange={e => { const nv = [...variants]; nv[idx].stock = +e.target.value; setVariants(nv); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Weight (g)</Label>
                    <Input className="h-8" type="number" value={v.weight} onChange={e => { const nv = [...variants]; nv[idx].weight = +e.target.value; setVariants(nv); }} />
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
          <TabsContent value="specs" className="mt-5">
            <div className="rounded-md border p-6 text-sm text-muted-foreground text-center">Key-value specifications editor.</div>
          </TabsContent>
          <TabsContent value="seo" className="mt-5 space-y-3">
            <div className="space-y-2"><Label>Meta title</Label><Input /></div>
            <div className="space-y-2"><Label>Meta description</Label><Textarea rows={3} /></div>
            <div className="space-y-2"><Label>Keywords</Label><Input placeholder="comma, separated" /></div>
          </TabsContent>
          <TabsContent value="images" className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label>Main Icon (Single File)</Label>
              <Input type="file" onChange={(e) => setIcon(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Product Images (Multiple)</Label>
              <Input type="file" multiple onChange={(e) => setImages(e.target.files)} />
            </div>
            <div className="rounded-md border-2 border-dashed p-6 text-center text-muted-foreground">
              {images ? `${images.length} files selected` : "No extra images selected"}
            </div>
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
