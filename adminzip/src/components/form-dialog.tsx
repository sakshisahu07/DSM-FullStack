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

export type FieldType = "text" | "number" | "textarea" | "select" | "switch" | "email" | "url" | "file" | "dynamic-list";

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
  listKeys?: { key: string; label: string; type?: FieldType }[];
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
              const listStr = values[f.name];
              let list: any[] = [];
              try {
                list = listStr ? JSON.parse(listStr) : [];
              } catch (e) {
                list = [];
              }
              if (!Array.isArray(list)) list = [];

              return (
                <div key={f.name} className={`${colClass} space-y-3 p-4 border rounded-md bg-white`}>
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-sm">{f.label}{f.required && " *"}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                       const newList = [...list, {}];
                       set(f.name, JSON.stringify(newList));
                    }}>Add Item</Button>
                  </div>
                  {list.length === 0 && <p className="text-xs text-gray-400 italic">No items added yet.</p>}
                  {list.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-3 p-3 border rounded-md relative bg-gray-50/50">
                      <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 bg-white" onClick={() => {
                        const newList = [...list];
                        newList.splice(idx, 1);
                        set(f.name, JSON.stringify(newList));
                      }}>×</Button>
                      <div className="grid grid-cols-1 gap-3 pr-8">
                         {f.listKeys?.map((lk) => {
                            const val = item[lk.key];
                            return (
                              <div key={lk.key} className="space-y-1">
                                 <Label className="text-xs text-gray-500 font-medium">{lk.label}</Label>
                                 {lk.type === 'textarea' ? (
                                   <Textarea value={val ?? ''} onChange={(e) => {
                                     const newList = [...list];
                                     newList[idx] = { ...newList[idx], [lk.key]: e.target.value };
                                     set(f.name, JSON.stringify(newList));
                                   }} rows={2} className="text-sm" />
                                 ) : lk.type === 'file' ? (
                                   <div className="space-y-1">
                                     {val && typeof val === 'string' && !item[`_hasNewFile_${lk.key}`] && (
                                       <div className="text-xs text-blue-500 break-all truncate">{val}</div>
                                     )}
                                     <Input type="file" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const newList = [...list];
                                          newList[idx] = { ...newList[idx], [`_hasNewFile_${lk.key}`]: true };
                                          set(f.name, JSON.stringify(newList));
                                          // Set the actual file in external values using the naming convention expected by atl-kits
                                          set(`${f.name}_file_${idx}_${lk.key}`, file);
                                        }
                                     }} className="text-xs cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                   </div>
                                 ) : (
                                   <Input type="text" value={val ?? ''} onChange={(e) => {
                                     const newList = [...list];
                                     newList[idx] = { ...newList[idx], [lk.key]: e.target.value };
                                     set(f.name, JSON.stringify(newList));
                                   }} className="text-sm" />
                                 )}
                              </div>
                            );
                         })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={f.name} className={`${colClass} space-y-1.5`}>
                <Label>{f.label}{f.required && " *"}</Label>
                  <Input
                    type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
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
