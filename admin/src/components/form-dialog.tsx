import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export type FieldType = "text" | "number" | "textarea" | "select" | "switch" | "email" | "url" | "file" | "date" | "datetime-local" | "dynamic-list";

export interface FormField {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  rows?: number;
  /** Width in 12-col grid; default 12 (full width) */
  span?: 6 | 12;
  disabled?: boolean;
  listKeys?: { key: string; label: string; type?: "text" | "textarea" | "file" }[];
}

export interface FormDialogProps<T extends Record<string, any>> {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  /** When set → Edit mode. When null → Create mode. */
  initialValues?: Partial<T> | null;
  defaultValues?: Partial<T>;
  submitLabel?: string;
  onSubmit: (values: T) => void;
  onValueChange?: (name: string, value: any, allValues: Record<string, any>) => void;
  externalValues?: Record<string, any>;
  setExternalValues?: (v: Record<string, any>) => void;
}

function emptyForType(t?: FieldType) {
  if (t === "number") return 0;
  if (t === "switch") return false;
  if (t === "file") return null;
  return "";
}

import { Plus, Trash2 } from "lucide-react";

function DynamicListField({ field, value, onChange, onSetExtra }: { field: FormField, value: string, onChange: (v: string) => void, onSetExtra: (k: string, v: any) => void }) {
  let items: any[] = [];
  try {
    items = JSON.parse(value || "[]");
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }

  const updateItems = (newItems: any[]) => {
    onChange(JSON.stringify(newItems));
  };

  const addItem = () => {
    const newItem: any = {};
    field.listKeys?.forEach(k => newItem[k.key] = "");
    updateItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const next = [...items];
    next.splice(index, 1);
    updateItems(next);
  };

  const updateItem = (index: number, key: string, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: val };
    updateItems(next);
  };

  return (
    <div className="space-y-3 rounded-md border p-4 bg-muted/10">
      <div className="flex justify-between items-center">
        <Label className="font-semibold text-primary">{field.label}</Label>
        <Button variant="outline" size="sm" onClick={addItem} type="button" className="gap-1 h-8">
          <Plus className="w-3 h-3" /> Add Item
        </Button>
      </div>
      {items.length === 0 && <p className="text-xs text-muted-foreground">No items added.</p>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 items-start border p-3 rounded-md bg-background relative group">
            <div className="flex-1 space-y-3">
              {field.listKeys?.map(lk => (
                <div key={lk.key}>
                  <Label className="text-xs mb-1.5 block text-muted-foreground">{lk.label}</Label>
                  {lk.type === "textarea" ? (
                    <Textarea 
                      value={item[lk.key] || ""} 
                      onChange={(e) => updateItem(i, lk.key, e.target.value)}
                      rows={2}
                      className="text-sm resize-y"
                    />
                  ) : lk.type === "file" ? (
                    <div className="space-y-2">
                      {item[lk.key]?.url && <img src={item[lk.key].url} className="w-10 h-10 object-contain rounded bg-muted" alt="icon"/>}
                      <Input 
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onSetExtra(`${field.name}_file_${i}_${lk.key}`, file);
                            updateItem(i, `_hasNewFile_${lk.key}`, "true");
                          }
                        }}
                        className="text-sm h-8 file:py-1 file:px-2 file:text-xs"
                      />
                    </div>
                  ) : (
                    <Input 
                      value={item[lk.key] || ""}
                      onChange={(e) => updateItem(i, lk.key, e.target.value)}
                      className="text-sm h-8"
                    />
                  )}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0 mt-6" onClick={() => removeItem(i)} type="button">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormDialog<T extends Record<string, any>>({
  open, onOpenChange, title, description, fields, initialValues, defaultValues,
  submitLabel, onSubmit, onValueChange, externalValues, setExternalValues,
}: FormDialogProps<T>) {
  const [internalValues, setInternalValues] = useState<Record<string, any>>({});
  const values = externalValues || internalValues;
  const setValues = (next: Record<string, any> | ((p: Record<string, any>) => Record<string, any>)) => {
    if (setExternalValues) {
      if (typeof next === 'function') {
        setExternalValues(next(externalValues || {}));
      } else {
        setExternalValues(next);
      }
    } else {
      setInternalValues(next);
    }
  };

  const [lastOpen, setLastOpen] = useState(false);
  const [lastInitialValues, setLastInitialValues] = useState<Partial<T> | null | undefined>(undefined);

  useEffect(() => {
    if (open && (!lastOpen || initialValues !== lastInitialValues)) {
      const next: Record<string, any> = {};
      fields.forEach((f) => {
        const fromInitial = initialValues?.[f.name];
        const fromDefault = defaultValues?.[f.name];
        next[f.name] = fromInitial ?? fromDefault ?? emptyForType(f.type);
      });
      setValues(next);
      setLastOpen(true);
      setLastInitialValues(initialValues);
    } else if (!open && lastOpen) {
      setValues({});
      setLastOpen(false);
      setLastInitialValues(undefined);
    }
  }, [open, initialValues, defaultValues, fields, lastOpen, lastInitialValues]);

  const set = (name: string, v: any) => {
    setValues((p) => {
      const next = { ...p, [name]: v };
      onValueChange?.(name, v, next);
      return next;
    });
  };

  const isValid = fields.every((f) => {
    if (!f.required) return true;
    const v = values[f.name];
    if (f.type === "file") return v !== null && v !== undefined;
    return f.type === "number" ? v !== "" && v !== null && v !== undefined
      : f.type === "switch" ? true
      : String(v ?? "").trim().length > 0;
  });

  const isEdit = !!initialValues;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 py-2">
          {fields.map((f) => {
            const span = f.span ?? 12;
            const colClass = span === 6 ? "col-span-12 sm:col-span-6" : "col-span-12";
            const v = values[f.name];

            if (f.type === "switch") {
              return (
                <div key={f.name} className={`${colClass} flex items-center justify-between rounded-md border px-3 py-2.5`}>
                  <Label htmlFor={f.name} className="cursor-pointer">{f.label}</Label>
                  <Switch id={f.name} checked={!!v} onCheckedChange={(c) => set(f.name, c)} />
                </div>
              );
            }

            if (f.type === "select") {
              return (
                <div key={f.name} className={`${colClass} space-y-1.5`}>
                  <Label>{f.label}{f.required && " *"}</Label>
                  <Select 
                    value={String(v ?? "")} 
                    onValueChange={(val) => set(f.name, val)}
                    disabled={f.disabled}
                  >
                    <SelectTrigger><SelectValue placeholder={f.placeholder ?? "Select…"} /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            if (f.type === "textarea") {
              return (
                <div key={f.name} className={`${colClass} space-y-1.5`}>
                  <Label>{f.label}{f.required && " *"}</Label>
                  <Textarea
                    rows={f.rows ?? 3}
                    value={v ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder}
                  />
                </div>
              );
            }

            if (f.type === "file") {
              return (
                <div key={f.name} className={`${colClass} space-y-1.5`}>
                  <Label>{f.label}{f.required && " *"}</Label>
                  <Input
                    type="file"
                    onChange={(e) => set(f.name, e.target.files?.[0] || null)}
                    disabled={f.disabled}
                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
              );
            }

            if (f.type === "dynamic-list") {
              return (
                <div key={f.name} className={`${colClass}`}>
                  <DynamicListField 
                    field={f}
                    value={v ?? "[]"}
                    onChange={(newVal) => set(f.name, newVal)}
                    onSetExtra={set}
                  />
                </div>
              );
            }

            return (
              <div key={f.name} className={`${colClass} space-y-1.5`}>
                <Label>{f.label}{f.required && " *"}</Label>
                  <Input
                    type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "url" ? "url" : f.type === "date" ? "date" : f.type === "datetime-local" ? "datetime-local" : "text"}
                    value={v ?? ""}
                    onChange={(e) => set(f.name, f.type === "number" ? (e.target.value === "" ? "" : +e.target.value) : e.target.value)}
                    placeholder={f.placeholder}
                    disabled={f.disabled}
                  />
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!isValid} onClick={() => onSubmit(values as T)}>
            {submitLabel ?? (isEdit ? "Save changes" : "Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
