import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";

export const Route = createFileRoute("/_app/content/tutorials")({
  component: ContentTutorialsPage,
});

interface Tutorial {
  id: string; title: string; level: "Beginner" | "Intermediate" | "Advanced"; duration: string; views: number; published: boolean;
}

const seed: Tutorial[] = [
  { id: "ct1", title: "Getting started with Arduino", level: "Beginner", duration: "15 min", views: 9842, published: true },
  { id: "ct2", title: "Build a weather station", level: "Intermediate", duration: "45 min", views: 5432, published: true },
  { id: "ct3", title: "ESP32 + Firebase realtime", level: "Advanced", duration: "1h 10m", views: 3210, published: true },
  { id: "ct4", title: "Servo motor control basics", level: "Beginner", duration: "10 min", views: 12030, published: true },
  { id: "ct5", title: "OLED display mini projects", level: "Intermediate", duration: "30 min", views: 4320, published: false },
];

const fields: FormField[] = [
  { name: "title", label: "Title", required: true },
  {
    name: "level", label: "Level", type: "select", required: true, span: 6,
    options: [
      { label: "Beginner", value: "Beginner" },
      { label: "Intermediate", value: "Intermediate" },
      { label: "Advanced", value: "Advanced" },
    ],
  },
  { name: "duration", label: "Duration", span: 6, placeholder: "15 min" },
  { name: "published", label: "Published", type: "switch" },
];

function ContentTutorialsPage() {
  const [items, setItems] = useState<Tutorial[]>(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tutorial | null>(null);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (t: Tutorial) => { setEditing(t); setOpen(true); };
  const onDelete = (t: Tutorial) => {
    setItems((p) => p.filter((x) => x.id !== t.id));
    toast.success(`Removed ${t.title}`);
  };
  const toggle = (id: string) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, published: !x.published } : x));
    toast.success("Updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutorials"
        subtitle="Storefront tutorials and guides."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> New tutorial</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><BookOpen className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold leading-tight">{t.title}</h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{t.level}</Badge>
                  <span>•</span>
                  <span>{t.duration}</span>
                  <span>•</span>
                  <span>{t.views.toLocaleString("en-IN")} views</span>
                </div>
              </div>
              <Switch checked={t.published} onCheckedChange={() => toggle(t.id)} />
            </div>
            <div className="mt-3 flex justify-end gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(t)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <FormDialog<Tutorial>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit tutorial" : "New tutorial"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ published: true, level: "Beginner" }}
        onSubmit={(v) => {
          if (editing) {
            setItems((p) => p.map((x) => x.id === editing.id ? { ...editing, ...v } : x));
            toast.success("Tutorial updated");
          } else {
            setItems((p) => [{ ...v, id: `ct-${Date.now()}`, views: 0 }, ...p]);
            toast.success("Tutorial created");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
