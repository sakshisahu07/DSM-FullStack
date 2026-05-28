import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog, type FormField } from "@/components/form-dialog";

export const Route = createFileRoute("/_app/b2b/job-applications")({
  component: ApplicationsPage,
});

interface App {
  id: string; candidate: string; role: string; experience: string;
  status: "new" | "shortlisted" | "interview" | "rejected" | "offered";
  date: string; shortlisted: boolean;
}

const seed: App[] = [
  { id: "APP-201", candidate: "Anjali Nair", role: "Senior Hardware Engineer", experience: "6 yrs", status: "interview", date: "Apr 30", shortlisted: true },
  { id: "APP-200", candidate: "Vikas Joshi", role: "Content Writer (Tech)", experience: "3 yrs", status: "shortlisted", date: "Apr 29", shortlisted: true },
  { id: "APP-199", candidate: "Megha Rao", role: "B2B Sales Executive", experience: "4 yrs", status: "new", date: "Apr 29", shortlisted: false },
  { id: "APP-198", candidate: "Rohan Pillai", role: "Senior Hardware Engineer", experience: "8 yrs", status: "offered", date: "Apr 26", shortlisted: true },
  { id: "APP-197", candidate: "Tina Kapoor", role: "Content Writer (Tech)", experience: "2 yrs", status: "rejected", date: "Apr 24", shortlisted: false },
];

const tone = {
  new: "bg-info/15 text-info",
  shortlisted: "bg-warning/15 text-warning",
  interview: "bg-primary/15 text-primary",
  offered: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

const fields: FormField[] = [
  { name: "candidate", label: "Candidate", required: true, span: 6 },
  { name: "experience", label: "Experience", span: 6, placeholder: "5 yrs" },
  { name: "role", label: "Applied for", required: true },
  { name: "date", label: "Date", span: 6 },
  {
    name: "status", label: "Stage", type: "select", required: true, span: 6,
    options: [
      { label: "New", value: "new" },
      { label: "Shortlisted", value: "shortlisted" },
      { label: "Interview", value: "interview" },
      { label: "Offered", value: "offered" },
      { label: "Rejected", value: "rejected" },
    ],
  },
  { name: "shortlisted", label: "Shortlisted", type: "switch" },
];

function ApplicationsPage() {
  const [items, setItems] = useState<App[]>(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<App | null>(null);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (r: App) => { setEditing(r); setOpen(true); };
  const onDelete = (r: App) => {
    setItems((p) => p.filter((x) => x.id !== r.id));
    toast.success(`Removed ${r.id}`);
  };
  const toggle = (id: string) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, shortlisted: !x.shortlisted } : x));
    toast.success("Updated");
  };

  const cols: Column<App>[] = [
    { key: "id", header: "ID", cell: (r) => <code className="text-xs">{r.id}</code> },
    { key: "candidate", header: "Candidate", cell: (r) => <span className="font-medium">{r.candidate}</span> },
    { key: "role", header: "Applied for", cell: (r) => r.role },
    { key: "experience", header: "Exp", cell: (r) => r.experience },
    { key: "date", header: "Date", cell: (r) => r.date },
    { key: "status", header: "Stage", cell: (r) => <Badge variant="outline" className={tone[r.status]}>{r.status}</Badge> },
    { key: "shortlisted", header: "Shortlisted", cell: (r) => <Switch checked={r.shortlisted} onCheckedChange={() => toggle(r.id)} /> },
    {
      key: "actions", header: "", className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Applications"
        subtitle="Candidates applying through the careers page."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Add application</Button>}
      />
      <DataTable storageKey="b2b.job-applications" data={items} columns={cols} searchKeys={["candidate", "role"]} />

      <FormDialog<App>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit application" : "New application"}
        fields={fields}
        initialValues={editing}
        defaultValues={{ status: "new", shortlisted: false, date: "Today" }}
        onSubmit={(v) => {
          if (editing) {
            setItems((p) => p.map((x) => x.id === editing.id ? { ...editing, ...v } : x));
            toast.success("Application updated");
          } else {
            setItems((p) => [{ ...v, id: `APP-${202 + p.length}` }, ...p]);
            toast.success("Application created");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
