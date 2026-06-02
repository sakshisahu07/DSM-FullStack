import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { useEffect, useCallback } from "react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/content/faq")({
  component: FaqPage,
});

interface Faq { 
  id: string; 
  q: string; 
  a: string; 
  published: boolean;
  group: string;
}

const API_BASE = API_BASE_URL + "/faq";

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("dsm_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Seed data removed to use API

const fields: FormField[] = [
  { name: "q", label: "Question", required: true },
  { name: "a", label: "Answer", type: "textarea", required: true, rows: 4 },
  { name: "published", label: "Published", type: "switch" },
];

function FaqPage() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}?limit=50`, {
        headers: { ...getAuthHeader() }
      });
      const json = await res.json();
      if (json.success) {
        const mapped = json.data.map((it: any) => ({
          id: it._id,
          q: it.question,
          a: it.answer,
          published: it.isActive,
          group: "General" // API doesn't have groups, using General
        }));
        setItems(mapped);
      }
    } catch (error) {
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (f: Faq) => { setEditing(f); setOpen(true); };
  
  const onDelete = async (f: Faq) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_BASE}/${f.id}`, { 
        method: "DELETE",
        headers: { ...getAuthHeader() }
      });
      const json = await res.json();
      if (json.success) {
        setItems((p) => p.filter((x) => x.id !== f.id));
        toast.success("Removed successfully");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const toggle = async (f: Faq) => {
    try {
      const res = await fetch(`${API_BASE}/${f.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify({ isActive: !f.published }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((p) => p.map((x) => x.id === f.id ? { ...x, published: !x.published } : x));
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        subtitle="Customer-facing FAQ groups."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> New FAQ</Button>}
      />

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Loading FAQs...</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No FAQs found. Create one to get started.</Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-4 italic text-primary">All Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {items.map((it) => (
                <AccordionItem key={it.id} value={it.id} className="border-b last:border-0 border-primary/10">
                  <div className="flex items-center gap-3">
                    <AccordionTrigger className="text-left flex-1 hover:no-underline hover:text-primary transition-colors py-4">
                      {it.q}
                    </AccordionTrigger>
                    <div className="flex items-center gap-1 pr-2">
                      <Switch checked={it.published} onCheckedChange={() => toggle(it)} title={it.published ? "Unpublish" : "Publish"} />
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(it)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(it)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {it.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      )}

      <FormDialog<Faq>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit FAQ" : "New FAQ"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ published: true, group: "Orders & Shipping" }}
        onSubmit={async (v) => {
          try {
            const body = {
              question: v.q,
              answer: v.a,
              isActive: v.published,
            };
            const method = editing ? "PUT" : "POST";
            const url = editing ? `${API_BASE}/${editing.id}` : API_BASE;
            
            const res = await fetch(url, {
              method,
              headers: { 
                "Content-Type": "application/json",
                ...getAuthHeader()
              },
              body: JSON.stringify(body),
            });
            const json = await res.json();
            
            if (json.success) {
              toast.success(`FAQ ${editing ? "updated" : "created"} successfully`);
              fetchFaqs();
              setOpen(false);
            } else {
              toast.error(json.message || "Operation failed");
            }
          } catch (error) {
            toast.error("Failed to save FAQ");
          }
        }}
      />
    </div>
  );
}
