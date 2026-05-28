import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/users/roles")({
  component: RolesPage,
});

const API_BASE = API_BASE_URL;

/* ── All available permissions ── */
const ALL_PERMISSIONS = [
  "products.view",
  "products.edit",
  "orders.view",
  "orders.edit",
  "affiliates.view",
  "affiliates.edit",
  "users.manage",
  "settings.manage",
  "marketing.manage",
  "content.manage",
  "tickets.manage",
];

const PERMISSION_GROUPS: Record<string, string[]> = {
  Products: ["products.view", "products.edit"],
  Orders: ["orders.view", "orders.edit"],
  Affiliates: ["affiliates.view", "affiliates.edit"],
  Users: ["users.manage"],
  Settings: ["settings.manage"],
  Marketing: ["marketing.manage"],
  Content: ["content.manage"],
  Tickets: ["tickets.manage"],
};

const ROLE_COLORS = [
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
];

interface Role {
  _id: string;
  name: string;
  permissions: string[];
  isSystemRole: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  totalUsers?: number;
}

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permSaving, setPermSaving] = useState<string | null>(null);
  const [localPerms, setLocalPerms] = useState<Record<string, string[]>>({});

  /* ── Fetch all roles ── */
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/roles`);
      const json = await res.json();
      if (json.success) {
        setRoles(json.data || []);
        // Initialise local permission state
        const permsMap: Record<string, string[]> = {};
        for (const r of json.data || []) {
          permsMap[r._id] = [...(r.permissions || [])];
        }
        setLocalPerms(permsMap);
      }
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  /* ── Delete role ── */
  const onDelete = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_BASE}/roles/${role._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Role "${role.name}" deleted`);
        setRoles((p) => p.filter((r) => r._id !== role._id));
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete role");
    }
  };

  /* ── Toggle single permission & PATCH ── */
  const togglePermission = (roleId: string, perm: string) => {
    setLocalPerms((prev) => {
      const current = prev[roleId] || [];
      return {
        ...prev,
        [roleId]: current.includes(perm)
          ? current.filter((p) => p !== perm)
          : [...current, perm],
      };
    });
  };

  const savePermissions = async (roleId: string) => {
    try {
      setPermSaving(roleId);
      const perms = localPerms[roleId] || [];
      const res = await apiFetch(`${API_BASE}/roles/${roleId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: perms }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Permissions updated successfully");
        setRoles((prev) =>
          prev.map((r) => (r._id === roleId ? { ...r, permissions: perms } : r))
        );
      } else {
        toast.error(json.message || "Failed to update permissions");
      }
    } catch {
      toast.error("Failed to update permissions");
    } finally {
      setPermSaving(null);
    }
  };

  const openCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleSaved = (savedRole: Role) => {
    setRoles((prev) => {
      const exists = prev.find((r) => r._id === savedRole._id);
      if (exists) return prev.map((r) => (r._id === savedRole._id ? savedRole : r));
      return [savedRole, ...prev];
    });
    setLocalPerms((prev) => ({
      ...prev,
      [savedRole._id]: [...(savedRole.permissions || [])],
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        subtitle="Define what each role can access and manage permissions."
        actions={
          <Button className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Role
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading roles…</p>
        </div>
      ) : roles.length === 0 ? (
        <Card className="p-20 text-center space-y-3">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">No roles found. Create one to get started.</p>
          <Button variant="outline" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> Create Role
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {roles.map((role, idx) => {
            const colorClass = ROLE_COLORS[idx % ROLE_COLORS.length];
            const perms = localPerms[role._id] || [];
            const hasChanges =
              JSON.stringify([...(role.permissions || [])].sort()) !==
              JSON.stringify([...perms].sort());

            return (
              <Card key={role._id} className="p-5 flex flex-col gap-4">
                {/* Role Header */}
                <div className="flex items-start justify-between pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg grid place-items-center ${colorClass}`}>
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{role.name}</span>
                        {role.isSystemRole && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5">
                            <Lock className="h-2.5 w-2.5" /> System
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {role.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                      <Users className="h-3 w-3" />
                      <span>{role.totalUsers ?? 0}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(role)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {!role.isSystemRole && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDelete(role)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="space-y-3">
                  {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPerms]) => (
                    <div key={groupName}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                        {groupName}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {groupPerms.map((perm) => (
                          <label
                            key={perm}
                            className="flex items-center gap-2 text-sm cursor-pointer group/perm"
                          >
                            <Checkbox
                              checked={perms.includes(perm)}
                              onCheckedChange={() => togglePermission(role._id, perm)}
                              className="data-[state=checked]:bg-primary"
                            />
                            <span className="font-mono text-xs text-muted-foreground group-hover/perm:text-foreground transition-colors">
                              {perm.split(".")[1]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="outline" className="text-xs gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    {perms.length} of {ALL_PERMISSIONS.length} permissions
                  </Badge>
                  <Button
                    size="sm"
                    disabled={!hasChanges || permSaving === role._id}
                    onClick={() => savePermissions(role._id)}
                    className="gap-1.5 h-7 text-xs"
                  >
                    {permSaving === role._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : null}
                    {permSaving === role._id ? "Saving…" : "Save Permissions"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
        onSaved={handleSaved}
      />
    </div>
  );
}

/* ── Create / Edit Dialog ── */
function RoleDialog({
  open,
  onOpenChange,
  role,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: Role | null;
  onSaved: (r: Role) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && role) {
      setName(role.name);
      setDescription(role.description || "");
      setPermissions([...(role.permissions || [])]);
    } else if (open && !role) {
      setName("");
      setDescription("");
      setPermissions([]);
    }
  }, [open, role]);

  const togglePerm = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const onSubmit = async () => {
    if (!name.trim()) return toast.error("Role name is required");
    try {
      setSaving(true);
      const body = { name: name.trim(), description: description.trim(), permissions };
      const url = role ? `${API_BASE}/roles/${role._id}` : `${API_BASE}/roles`;
      const method = role ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || (role ? "Role updated" : "Role created"));
        onSaved(json.data);
        onOpenChange(false);
      } else {
        toast.error(json.message || "Operation failed");
      }
    } catch {
      toast.error("Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label>Role Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Manager, Editor"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role's responsibilities"
            />
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPerms]) => (
              <div key={groupName} className="border rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {groupName}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {groupPerms.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={permissions.includes(perm)}
                        onCheckedChange={() => togglePerm(perm)}
                      />
                      <span className="font-mono text-xs">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {saving ? "Saving…" : role ? "Save Changes" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
