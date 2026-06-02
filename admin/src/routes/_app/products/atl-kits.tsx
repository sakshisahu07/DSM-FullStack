import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, GraduationCap, Clock, Users, Pencil, Trash2, School, Phone, MapPin, MessageSquare, Box, LayoutTemplate } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/products/atl-kits")({
  component: AtlKitsPage,
});

interface Kit {
  id: string; name: string; level: "Beginner" | "Intermediate" | "Advanced"; age: string;
  projects: number; included: number; price: number; active: boolean;
}

interface AtlInquiry {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  city: string;
  areaSqFt: number;
  budgetRange: string;
  message: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1";
const API_INQUIRY = `${API_BASE}/alt/inquiry`;
const API_PAGE = `${API_BASE}/alt/page`;
const API_UPDATE_PAGE = `${API_BASE}/alt/update-page`;

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("dsm_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

const seed: Kit[] = [
  { id: "k1", name: "Robotics Starter", level: "Beginner", age: "8-12", projects: 12, included: 28, price: 2999, active: true },
  { id: "k2", name: "IoT Explorer", level: "Intermediate", age: "12-16", projects: 18, included: 42, price: 4999, active: true },
  { id: "k3", name: "AI Vision Lab", level: "Advanced", age: "14+", projects: 24, included: 56, price: 8999, active: true },
  { id: "k4", name: "Renewable Energy", level: "Intermediate", age: "12-16", projects: 10, included: 34, price: 3999, active: false },
];

const kitFields: FormField[] = [
  { name: "name", label: "Kit name", required: true },
  {
    name: "level", label: "Level", type: "select", required: true, span: 6,
    options: [
      { label: "Beginner", value: "Beginner" },
      { label: "Intermediate", value: "Intermediate" },
      { label: "Advanced", value: "Advanced" },
    ],
  },
  { name: "age", label: "Age range", span: 6, placeholder: "8-12" },
  { name: "projects", label: "# Projects", type: "number", span: 6 },
  { name: "included", label: "Components", type: "number", span: 6 },
  { name: "price", label: "Price (₹)", type: "number", required: true },
  { name: "active", label: "Active", type: "switch" },
];

const inquiryFields: FormField[] = [
  { name: "firstName", label: "First Name", required: true, span: 6 },
  { name: "lastName", label: "Last Name", required: true, span: 6 },
  { name: "phone", label: "Phone", required: true, span: 6 },
  { name: "schoolName", label: "School Name", required: true, span: 6 },
  { name: "city", label: "City", required: true, span: 6 },
  { name: "areaSqFt", label: "Area (Sq Ft)", type: "number", required: true, span: 6 },
  { name: "budgetRange", label: "Budget Range", required: true },
  { name: "message", label: "Message", type: "textarea", required: true },
];

const pageFields: FormField[] = [
  { name: "heading", label: "Heading", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "subTitle", label: "Sub Title", required: true },
  { name: "subDescription", label: "Sub Description", type: "textarea", required: true },
  { name: "bannerFile", label: "New Banner Image", type: "file" },
  { name: "galleryImageFile", label: "Add Gallery Image", type: "file" },
  { name: "processHeading", label: "Process Section Heading" },
  { name: "processImageFile", label: "Process Section Image", type: "file" },
  { name: "setupHeading", label: "Setup Section Heading" },
  { name: "setupImageFile", label: "Setup Section Image", type: "file" },
  { name: "cardsStr", label: "Cards", type: "dynamic-list", listKeys: [{key: "icon", label: "Icon", type: "file"}, {key: "title", label: "Title"}, {key: "description", label: "Description", type: "textarea"}] },
  { name: "setupDetailsStr", label: "Setup Details", type: "dynamic-list", listKeys: [{key: "setupIcon", label: "Setup Icon", type: "file"}, {key: "title", label: "Title"}, {key: "description", label: "Description", type: "textarea"}] },
  { name: "setProcessStr", label: "Set Process", type: "dynamic-list", listKeys: [{key: "processIcon", label: "Process Icon", type: "file"}, {key: "heading", label: "Heading"}, {key: "description", label: "Description", type: "textarea"}] },
];

function AtlKitsPage() {
  const [kits, setKits] = useState<Kit[]>(seed);
  const [inquiries, setInquiries] = useState<AtlInquiry[]>([]);
  const [loadingInq, setLoadingInq] = useState(false);
  
  const [kitOpen, setKitOpen] = useState(false);
  const [inqOpen, setInqOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);

  const [pageData, setPageData] = useState<any>(null);
  const [loadingPage, setLoadingPage] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoadingInq(true);
      const res = await fetch(API_INQUIRY, { headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) {
        setInquiries(json.data.map((i: any) => ({
          id: i._id,
          firstName: i.firstName,
          lastName: i.lastName,
          phone: i.phone,
          schoolName: i.schoolName,
          city: i.city,
          areaSqFt: i.areaSqFt,
          budgetRange: i.budgetRange,
          message: i.message,
          createdAt: i.createdAt,
        })));
      }
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoadingInq(false);
    }
  }, []);

  const fetchPageData = useCallback(async () => {
    try {
      setLoadingPage(true);
      const res = await fetch(API_PAGE, { headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) {
        setPageData(json);
      }
    } catch (error) {
      toast.error("Failed to load page data");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
    fetchPageData();
  }, [fetchInquiries, fetchPageData]);

  const onCreateKit = () => { setEditingKit(null); setKitOpen(true); };
  const onEditKit = (k: Kit) => { setEditingKit(k); setKitOpen(true); };
  const onDeleteKit = (k: Kit) => {
    setKits((p) => p.filter((x) => x.id !== k.id));
    toast.success(`Removed ${k.name}`);
  };
  const toggleKit = (id: string) => {
    setKits((p) => p.map((x) => x.id === id ? { ...x, active: !x.active } : x));
    toast.success("Updated");
  };

  const stripId = (arr: any[]) => arr.map(({ _id, ...rest }) => rest);

  const initialPageValues = pageData ? {
    heading: pageData.heading || "",
    description: pageData.description || "",
    subTitle: pageData.subTitle || "",
    subDescription: pageData.subDescription || "",
    processHeading: pageData.processHeading || "",
    setupHeading: pageData.setupHeading || "",
    cardsStr: JSON.stringify(pageData.cards ? stripId(pageData.cards) : []),
    setupDetailsStr: JSON.stringify(pageData.setupDetails ? stripId(pageData.setupDetails) : []),
    setProcessStr: JSON.stringify(pageData.setProcess ? stripId(pageData.setProcess) : []),
  } : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ATL Kits Management"
        subtitle="Manage ATL kit inventory and track school inquiries."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => setInqOpen(true)}><Plus className="h-4 w-4" /> New Inquiry</Button>
            <Button className="gap-1.5" onClick={onCreateKit}><Plus className="h-4 w-4" /> New Kit</Button>
          </div>
        }
      />

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="bg-primary/5 p-1 border border-primary/10">
          <TabsTrigger value="catalog" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Box className="h-4 w-4" /> Kits Catalog
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <School className="h-4 w-4" /> School Inquiries
          </TabsTrigger>
          <TabsTrigger value="page-content" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutTemplate className="h-4 w-4" /> Landing Page
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kits.map((k) => (
              <Card key={k.id} className="p-5 flex flex-col group border-primary/10 hover:border-primary/40 transition-all shadow-sm">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center mb-4">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="w-fit">{k.level}</Badge>
                  <Switch checked={k.active} onCheckedChange={() => toggleKit(k.id)} />
                </div>
                <h3 className="font-semibold text-lg">{k.name}</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" /> Age {k.age}</div>
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {k.projects} projects</div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground font-medium">{k.included} components included</div>
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <div className="text-xl font-bold text-primary">₹{k.price.toLocaleString("en-IN")}</div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onEditKit(k)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDeleteKit(k)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card className="border-primary/10 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>School & Location</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingInq ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">Loading inquiries...</TableCell></TableRow>
                ) : inquiries.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">No inquiries found.</TableCell></TableRow>
                ) : (
                  inquiries.map((inq) => (
                    <TableRow key={inq.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <div className="font-medium flex items-center gap-2"><School className="h-4 w-4 text-primary" /> {inq.schoolName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {inq.city}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{inq.firstName} {inq.lastName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" /> {inq.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs"><strong>Area:</strong> {inq.areaSqFt} sqft</div>
                        <div className="text-xs mt-1"><strong>Budget:</strong> {inq.budgetRange}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="text-xs text-muted-foreground italic line-clamp-2" title={inq.message}>
                          <MessageSquare className="h-3 w-3 inline mr-1" /> {inq.message}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="page-content">
          {loadingPage ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground italic">Loading page content...</div>
          ) : !pageData ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground italic">No page data available.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => setPageOpen(true)} className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit Landing Page
                </Button>
              </div>
              <Card className="p-6 space-y-4 border-primary/10 shadow-sm">
                <h3 className="text-lg font-semibold border-b pb-2">Hero Section</h3>
                {pageData.banner?.url && (
                   <img src={pageData.banner.url} alt="Banner" className="w-full h-32 object-cover rounded-md" />
                )}
                <div><strong className="text-sm">Heading:</strong> <p className="text-sm text-muted-foreground">{pageData.heading}</p></div>
                <div><strong className="text-sm">Description:</strong> <p className="text-sm text-muted-foreground">{pageData.description}</p></div>
                <div><strong className="text-sm">Sub Title:</strong> <p className="text-sm text-muted-foreground">{pageData.subTitle}</p></div>
                <div><strong className="text-sm">Sub Description:</strong> <p className="text-sm text-muted-foreground">{pageData.subDescription}</p></div>
              </Card>

              <Card className="p-6 space-y-4 border-primary/10 shadow-sm">
                <h3 className="text-lg font-semibold border-b pb-2">Features & Benefits</h3>
                {pageData.commonFeatures && (
                  <div className="mb-4">
                    <div className="font-medium text-sm">{pageData.commonFeatures.heading}</div>
                    <div className="text-sm text-muted-foreground">{pageData.commonFeatures.description}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {pageData.cards?.map((card: any) => (
                    <div key={card._id} className="border p-3 rounded-md bg-primary/5">
                      {card.icon?.url && <img src={card.icon.url} alt="Icon" className="w-8 h-8 mb-2" />}
                      <div className="font-medium text-sm">{card.title}</div>
                      <div className="text-xs text-muted-foreground">{card.description}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 space-y-4 border-primary/10 shadow-sm md:col-span-2">
                <h3 className="text-lg font-semibold border-b pb-2">Setup & Process</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-sm mb-3">Setup Details</h4>
                    <div className="space-y-3">
                      {pageData.setupDetails?.map((item: any) => (
                        <div key={item._id} className="flex gap-3 items-start p-3 border rounded-md">
                          {item.setupIcon?.url && <img src={item.setupIcon.url} className="w-10 h-10 object-contain rounded bg-muted" alt="icon"/>}
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-3">Process Steps</h4>
                    <div className="space-y-3">
                      {pageData.setProcess?.map((item: any) => (
                        <div key={item._id} className="flex gap-3 items-start p-3 border rounded-md">
                          {item.processIcon?.url && <img src={item.processIcon.url} className="w-10 h-10 object-contain rounded bg-muted" alt="icon"/>}
                          <div>
                            <div className="font-medium text-sm">{item.heading}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4 border-primary/10 shadow-sm md:col-span-2">
                <h3 className="text-lg font-semibold border-b pb-2">Gallery Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {pageData.images?.map((img: any) => (
                    <img key={img._id} src={img.url} alt="Gallery" className="w-full aspect-square object-cover rounded-md border" />
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FormDialog<Kit>
        open={kitOpen}
        onOpenChange={setKitOpen}
        title={editingKit ? "Edit kit" : "New ATL kit"}
        fields={kitFields}
        initialValues={editingKit}
        defaultValues={{ active: true, level: "Beginner" }}
        onSubmit={(v) => {
          if (editingKit) {
            setKits((p) => p.map((x) => x.id === editingKit.id ? { ...editingKit, ...v } : x));
            toast.success("Kit updated");
          } else {
            setKits((p) => [{ ...v, id: `k-${Date.now()}` }, ...p]);
            toast.success("Kit created");
          }
          setKitOpen(false);
        }}
      />

      <FormDialog<AtlInquiry>
        open={inqOpen}
        onOpenChange={setInqOpen}
        title="Manual Inquiry Entry"
        fields={inquiryFields}
        onSubmit={async (v) => {
          try {
            const res = await fetch(API_INQUIRY, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...getAuthHeader() },
              body: JSON.stringify(v),
            });
            const json = await res.json();
            if (json.success) {
              toast.success("Inquiry recorded successfully");
              fetchInquiries();
              setInqOpen(false);
            } else {
              toast.error(json.message || "Failed to create inquiry");
            }
          } catch (error) {
            toast.error("Operation failed");
          }
        }}
      />

      <FormDialog<any>
        open={pageOpen}
        onOpenChange={setPageOpen}
        title="Update Landing Page"
        fields={pageFields}
        initialValues={initialPageValues}
        onSubmit={async (v) => {
          try {
            const fd = new FormData();
            fd.append("heading", v.heading);
            fd.append("description", v.description);
            fd.append("subTitle", v.subTitle);
            fd.append("subDescription", v.subDescription);
            if (v.processHeading) fd.append("processHeading", v.processHeading);
            if (v.setupHeading) fd.append("setupHeading", v.setupHeading);

            if (v.bannerFile) fd.append("banner", v.bannerFile);
            if (v.galleryImageFile) fd.append("images", v.galleryImageFile);
            if (v.processImageFile) fd.append("processImageFile", v.processImageFile);
            if (v.setupImageFile) fd.append("setupImageFile", v.setupImageFile);

            if (v.cardsStr) {
              const cards = JSON.parse(v.cardsStr || "[]");
              let cardIconIndex = 0;
              cards.forEach((c: any, i: number) => {
                if (c._hasNewFile_icon) {
                  const file = v[`cardsStr_file_${i}_icon`];
                  if (file) {
                    fd.append("cardIcons", file);
                    c.newIconIndex = cardIconIndex++;
                  }
                  delete c._hasNewFile_icon;
                }
              });
              fd.append("cards", JSON.stringify(cards));
            }

            if (v.setupDetailsStr) {
              const setupDetails = JSON.parse(v.setupDetailsStr || "[]");
              let setupIconIndex = 0;
              setupDetails.forEach((s: any, i: number) => {
                if (s._hasNewFile_setupIcon) {
                  const file = v[`setupDetailsStr_file_${i}_setupIcon`];
                  if (file) {
                    fd.append("setupIcons", file);
                    s.newIconIndex = setupIconIndex++;
                  }
                  delete s._hasNewFile_setupIcon;
                }
              });
              fd.append("setupDetails", JSON.stringify(setupDetails));
            }

            if (v.setProcessStr) {
              const setProcess = JSON.parse(v.setProcessStr || "[]");
              let processIconIndex = 0;
              setProcess.forEach((p: any, i: number) => {
                if (p._hasNewFile_processIcon) {
                  const file = v[`setProcessStr_file_${i}_processIcon`];
                  if (file) {
                    fd.append("processIcons", file);
                    p.newIconIndex = processIconIndex++;
                  }
                  delete p._hasNewFile_processIcon;
                }
              });
              fd.append("setProcess", JSON.stringify(setProcess));
            }

            const res = await fetch(API_UPDATE_PAGE, {
              method: "PUT",
              headers: getAuthHeader(),
              body: fd,
            });
            const json = await res.json();
            if (json.success) {
              toast.success("Landing page updated successfully");
              fetchPageData();
              setPageOpen(false);
            } else {
              toast.error(json.message || "Failed to update page");
            }
          } catch (error) {
            toast.error("Operation failed");
          }
        }}
      />
    </div>
  );
}
