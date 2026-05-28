import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, MapPin, Briefcase, Pencil, Trash2 } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";

import { useEffect, useCallback } from "react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/b2b/careers")({
  component: CareersPage,
});

interface Job {
  id: string;
  title: string;
  type: string;
  workMode: string;
  location: string;
  address: string;
  description: string;
  roleOverview: string;
  responsibilities: string[];
  skills: string[];
  open: boolean;
  apps?: number;
  experience?: number;
  countryId?: string;
  stateId?: string;
  cityId?: string;
}

interface JobFormData {
  title: string;
  jobType: string;
  workMode: string;
  country: string;
  state: string;
  city: string;
  experience: number;
  address: string;
  description: string;
  roleOverview: string;
  responsibilities: string;
  skills: string;
  isActive: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || "https://priyashu.in/api/v1";
const API_JOBS = `${API_BASE}/jobs`;
const API_JOB_OP = `${API_BASE}/job`;

function CareersPage() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  // States for dynamic dropdown options
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(API_JOBS);
      const json = await res.json();
      if (json.success) {
        const jobsArray = json.data?.jobs || (Array.isArray(json.data) ? json.data : []);
        const mapped: Job[] = jobsArray.map((j: any) => ({
          id: j._id || `temp-${Math.random()}`,
          title: j.title || "Untitled Position",
          type: j.jobType || "full-time",
          workMode: j.workMode || "remote",
          location: (typeof j.city === 'object' && j.city) ? j.city.name : (j.city || "N/A"),
          address: j.address || "",
          description: j.description || "",
          roleOverview: j.roleOverview || "",
          responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities : [],
          skills: Array.isArray(j.skills) ? j.skills : [],
          open: !!j.isActive,
          apps: Math.floor(Math.random() * 20),
          experience: Number(j.experience || 0),
          countryId: (typeof j.country === 'object' && j.country) ? j.country._id : (j.country || ""),
          stateId: (typeof j.state === 'object' && j.state) ? j.state._id : (j.state || ""),
          cityId: (typeof j.city === 'object' && j.city) ? j.city._id : (j.city || ""),
        }));
        setItems(mapped);
      }
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const [countriesRes, statesRes, citiesRes] = await Promise.all([
        apiFetch(`${API_BASE}/countries`),
        apiFetch(`${API_BASE}/states`),
        apiFetch(`${API_BASE}/cities`),
      ]);

      const [cJson, sJson, ciJson] = await Promise.all([
        countriesRes.json(),
        statesRes.json(),
        citiesRes.json(),
      ]);

      if (cJson.success) {
        setCountries(cJson.data?.data || cJson.data || []);
      }
      if (sJson.success) {
        setStates(sJson.data?.data || sJson.data || []);
      }
      if (ciJson.success) {
        const cityList = Array.isArray(ciJson.data) ? ciJson.data : (ciJson.data?.data || []);
        setCities(cityList);
      }
    } catch (error) {
      console.error("Failed to fetch country/state/city configurations", error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchLocations();
  }, [fetchJobs, fetchLocations]);

  const onCreate = () => {
    setEditing(null);
    const defaultCountry = countries[0]?._id || "69c389b43f5fc953412718a0";
    
    const countryStates = states.filter(s => {
      const cId = typeof s.countryId === 'object' && s.countryId ? s.countryId._id : s.countryId;
      return cId === defaultCountry;
    });
    const defaultState = countryStates[0]?._id || "69c39e01202240d9f7d0a17a";

    const stateCities = cities.filter(c => {
      const sId = typeof c.stateId === 'object' && c.stateId ? c.stateId._id : c.stateId;
      return sId === defaultState;
    });
    const defaultCity = stateCities[0]?._id || "69ccba87eb2e259d4ad54c99";

    setFormValues({
      title: "",
      jobType: "full-time",
      workMode: "remote",
      experience: 2,
      address: "",
      country: defaultCountry,
      state: defaultState,
      city: defaultCity,
      description: "",
      roleOverview: "",
      responsibilities: "",
      skills: "",
      isActive: true,
    });
    setOpen(true);
  };

  const onEdit = (j: Job) => {
    setEditing(j);
    setFormValues({
      title: j.title || "",
      jobType: j.type || "full-time",
      workMode: j.workMode || "remote",
      country: j.countryId || "69c389b43f5fc953412718a0",
      state: j.stateId || "69c39e01202240d9f7d0a17a",
      city: j.cityId || "69ccba87eb2e259d4ad54c99",
      experience: j.experience || 0,
      address: j.address || "",
      description: j.description || "",
      roleOverview: j.roleOverview || "",
      responsibilities: (j.responsibilities || []).join(", "),
      skills: (j.skills || []).join(", "),
      isActive: !!j.open,
    });
    setOpen(true);
  };
  
  const onDelete = async (j: Job) => {
    if (!window.confirm(`Are you sure you want to delete ${j.title}?`)) return;
    try {
      const res = await apiFetch(`${API_JOB_OP}/${j.id}`, { 
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setItems((p) => p.filter((x) => x.id !== j.id));
        toast.success("Job deleted");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const toggle = async (j: Job) => {
    try {
      const res = await apiFetch(`${API_JOB_OP}/${j.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !j.open }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((p) => p.map((x) => x.id === j.id ? { ...x, open: !x.open } : x));
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // Dynamically compute the dropdown filter criteria based on current form selections
  const selectedCountry = formValues.country || "";
  const selectedState = formValues.state || "";

  const filteredStates = states.filter((s) => {
    const cId = typeof s.countryId === "object" && s.countryId ? s.countryId._id : s.countryId;
    return cId === selectedCountry;
  });

  const filteredCities = cities.filter((c) => {
    const sId = typeof c.stateId === "object" && c.stateId ? c.stateId._id : c.stateId;
    return sId === selectedState;
  });

  const fields: FormField[] = [
    { name: "title", label: "Job title", required: true },
    {
      name: "jobType", label: "Job Type", type: "select", required: true, span: 6,
      options: [
        { label: "Full-time", value: "full-time" },
        { label: "Part-time", value: "part-time" },
        { label: "Contract", value: "contract" },
        { label: "Internship", value: "internship" },
      ],
    },
    {
      name: "workMode", label: "Work Mode", type: "select", required: true, span: 6,
      options: [
        { label: "On-site", value: "on-site" },
        { label: "Remote", value: "remote" },
        { label: "Hybrid", value: "hybrid" },
      ],
    },
    { name: "experience", label: "Experience (Years)", type: "number", required: true, span: 6 },
    { name: "address", label: "Address", required: true, span: 6 },
    {
      name: "country", label: "Country", type: "select", required: true, span: 6,
      options: countries.map((c) => ({ label: c.name, value: c._id })),
    },
    {
      name: "state", label: "State", type: "select", required: true, span: 6,
      options: filteredStates.map((s) => ({ label: s.name, value: s._id })),
    },
    {
      name: "city", label: "City", type: "select", required: true, span: 6,
      options: filteredCities.map((c) => ({ label: c.name, value: c._id })),
    },
    { name: "description", label: "Job Description", type: "textarea", required: true },
    { name: "roleOverview", label: "Role Overview", type: "textarea", required: true },
    { name: "responsibilities", label: "Responsibilities (comma separated)", type: "textarea", required: true, rows: 2 },
    { name: "skills", label: "Skills (comma separated)", type: "textarea", required: true, rows: 2 },
    { name: "isActive", label: "Active & Open", type: "switch" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Careers"
        subtitle="Open positions on the careers page."
        actions={<Button className="gap-1.5" onClick={onCreate}><Plus className="h-4 w-4" /> Post job</Button>}
      />

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Loading job postings...</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground italic">No jobs posted yet.</Card>
      ) : (
        <div className="space-y-3">
          {items.map((j) => (
            <Card key={j.id} className="p-5 flex items-center gap-4 flex-wrap hover:border-primary/40 transition-colors shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><Briefcase className="h-5 w-5" /></div>
              <div className="flex-1 min-w-[220px]">
                <div className="font-semibold text-lg">{j.title}</div>
                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="capitalize px-1.5 py-0.5 bg-muted rounded font-medium">{j.workMode}</span>
                  <span className="capitalize">{j.type}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                </div>
              </div>
              <div className="text-sm"><strong>{j.apps}</strong> <span className="text-muted-foreground">applicants</span></div>
              <Badge variant={j.open ? "default" : "secondary"} className={j.open ? "bg-success text-success-foreground" : ""}>
                {j.open ? "Open" : "Closed"}
              </Badge>
              <div className="flex items-center gap-2">
                <Switch checked={j.open} onCheckedChange={() => toggle(j)} />
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(j)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(j)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog<JobFormData>
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit job" : "Post a job"}
        fields={fields}
        externalValues={formValues}
        setExternalValues={setFormValues}
        onValueChange={(name, val) => {
          if (name === "country") {
            const countryStates = states.filter(s => {
              const cId = typeof s.countryId === 'object' && s.countryId ? s.countryId._id : s.countryId;
              return cId === val;
            });
            const firstStateId = countryStates[0]?._id || "";
            
            const stateCities = cities.filter(c => {
              const sId = typeof c.stateId === 'object' && c.stateId ? c.stateId._id : c.stateId;
              return sId === firstStateId;
            });
            const firstCityId = stateCities[0]?._id || "";

            setFormValues(p => ({
              ...p,
              country: val,
              state: firstStateId,
              city: firstCityId
            }));
          } else if (name === "state") {
            const stateCities = cities.filter(c => {
              const sId = typeof c.stateId === 'object' && c.stateId ? c.stateId._id : c.stateId;
              return sId === val;
            });
            const firstCityId = stateCities[0]?._id || "";

            setFormValues(p => ({
              ...p,
              state: val,
              city: firstCityId
            }));
          }
        }}
        onSubmit={async (v: JobFormData) => {
          try {
            const body = {
              title: v.title,
              jobType: v.jobType,
              workMode: v.workMode,
              experience: Number(v.experience || 0),
              country: v.country,
              state: v.state,
              city: v.city,
              address: v.address,
              description: v.description,
              roleOverview: v.roleOverview,
              responsibilities: v.responsibilities.split(",").map((s) => s.trim()).filter(Boolean),
              skills: v.skills.split(",").map((s) => s.trim()).filter(Boolean),
              isActive: v.isActive,
            };

            const method = editing ? "PUT" : "POST";
            const url = editing ? `${API_JOB_OP}/${editing.id}` : API_JOB_OP;
            
            const res = await apiFetch(url, {
              method,
              body: JSON.stringify(body),
            });
            const json = await res.json();
            
            if (json.success) {
              toast.success(`Job ${editing ? "updated" : "posted"} successfully`);
              fetchJobs();
              setOpen(false);
            } else {
              toast.error(json.message || "Operation failed");
            }
          } catch (error) {
            toast.error("Failed to save job");
          }
        }}
      />
    </div>
  );
}
