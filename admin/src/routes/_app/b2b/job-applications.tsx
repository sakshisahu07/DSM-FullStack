import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog, type FormField } from "@/components/form-dialog";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_app/b2b/job-applications")({
  component: ApplicationsPage,
});

interface App {
  id: string; 
  candidate: string; 
  role: string; 
  location: string;
  status: string;
  date: string; 
  raw: any;
}

const tone: Record<string, string> = {
  pending: "bg-info/15 text-info",
  reviewed: "bg-primary/15 text-primary",
  shortlisted: "bg-warning/15 text-warning",
  rejected: "bg-destructive/15 text-destructive",
  new: "bg-info/15 text-info",
  interview: "bg-primary/15 text-primary",
  offered: "bg-success/15 text-success",
};

const fields: FormField[] = [
  { name: "status", label: "Stage", type: "select", required: true,
    options: [
      { label: "Pending", value: "Pending" },
      { label: "Reviewed", value: "Reviewed" },
      { label: "Shortlisted", value: "Shortlisted" },
      { label: "Rejected", value: "Rejected" },
    ],
  },
];

function ApplicationsPage() {
  const [items, setItems] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<App | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/applications/all");
      const data = await res.json();
      if (data.success && data.data?.applications) {
        setItems(data.data.applications.map((app: any) => ({
          id: app._id,
          candidate: `${app.firstName} ${app.lastName}`,
          role: app.jobId?.title || "N/A",
          location: [app.city, app.state, app.country].filter(Boolean).join(", "),
          date: new Date(app.createdAt).toLocaleDateString(),
          status: app.status || "Pending",
          raw: app
        })));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onEdit = (r: App) => { setEditing(r); setOpen(true); };
  
  const cols: Column<App>[] = [
    { key: "candidate", header: "Candidate", cell: (r) => (
       <div className="flex flex-col">
          <span className="font-medium">{r.candidate}</span>
          <span className="text-[10px] text-muted-foreground">{r.raw?.phone} • {r.raw?.email || "No email"}</span>
       </div>
    )},
    { key: "role", header: "Applied for", cell: (r) => r.role },
    { key: "location", header: "Location", cell: (r) => r.location },
    { key: "date", header: "Date", cell: (r) => r.date },
    { key: "status", header: "Stage", cell: (r) => <Badge variant="outline" className={tone[r.status.toLowerCase()] || "bg-gray-100"}>{r.status}</Badge> },
    {
      key: "actions", header: "", className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          {r.raw?.resume && (
            <Button size="sm" variant="outline" className="h-8" asChild>
              <a href={r.raw.resume} target="_blank" rel="noopener noreferrer">Resume</a>
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  const handleUpdateStatus = async (values: any) => {
    if (!editing) return;
    try {
      const res = await apiFetch(`/application/${editing.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: values.status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Application status updated");
        fetchApplications();
        setOpen(false);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Applications"
        subtitle="Candidates applying through the careers page."
      />
      
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Loading applications...</div>
      ) : (
        <DataTable storageKey="b2b.job-applications" data={items} columns={cols} searchKeys={["candidate", "role"]} />
      )}

      <FormDialog<App>
        open={open}
        onOpenChange={setOpen}
        title="Update Application Status"
        fields={fields}
        initialValues={editing ? { status: editing.status } as any : undefined}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
}

