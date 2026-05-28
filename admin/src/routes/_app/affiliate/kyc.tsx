import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api";

export const Route = createFileRoute("/_app/affiliate/kyc")({
  component: KycPage,
});

function KycPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reject, setReject] = useState<any | null>(null);
  const [approve, setApprove] = useState<any | null>(null);
  const [tier, setTier] = useState("silver");
  const [reason, setReason] = useState("");

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/affiliate/admin/list?status=pending");
      if (res.data.success) {
        setItems(res.data.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to load KYC requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const doApprove = async () => {
    if (!approve) return;
    try {
      const res = await apiClient.patch(`/affiliate/admin/${approve._id}/approve`);
      if (res.data.success) {
        setItems((p) => p.filter((x) => x._id !== approve._id));
        toast.success(`Approved ${approve.firstName} ${approve.lastName}`);
        setApprove(null);
      } else {
        toast.error(res.data.message || "Failed to approve");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  const doReject = async () => {
    if (!reject) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      const res = await apiClient.patch(`/affiliate/admin/${reject._id}/reject`, { reason });
      if (res.data.success) {
        setItems((p) => p.filter((x) => x._id !== reject._id));
        toast.success(`Rejected: ${reason}`);
        setReject(null);
        setReason("");
      } else {
        toast.error(res.data.message || "Failed to reject");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="KYC Approvals" subtitle={`${items.length} pending review`} />

      {loading ? (
        <Card className="p-12 text-center text-muted-foreground">
          Loading pending requests...
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          All caught up — no pending KYC requests.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((k) => (
            <Card key={k._id} className="p-5 space-y-4">
              <div>
                <div className="font-semibold">{k.firstName} {k.lastName}</div>
                <div className="text-xs text-muted-foreground">{k.phone} • {k.email}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Submitted {format(new Date(k.createdAt), "dd MMM yyyy")}
                </div>
              </div>

              <div className="space-y-2">
                {[k.panNumber || "PAN Document"].map((doc, i) => (
                  <button key={i} className="w-full flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => window.open(k.panImage, "_blank")}>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">{doc}</span>
                    <span className="ml-auto text-xs text-muted-foreground">View</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive" onClick={() => setReject(k)}>
                  <X className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
                <Button size="sm" className="flex-1" onClick={() => setApprove(k)}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Approve modal */}
      <Dialog open={!!approve} onOpenChange={(o) => !o && setApprove(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve {approve?.firstName}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Commission tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">Bronze — 5%</SelectItem>
                <SelectItem value="silver">Silver — 8%</SelectItem>
                <SelectItem value="gold">Gold — 12%</SelectItem>
                <SelectItem value="platinum">Platinum — 18%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprove(null)}>Cancel</Button>
            <Button onClick={doApprove}>Confirm approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject modal */}
      <Dialog open={!!reject} onOpenChange={(o) => !o && setReject(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {reject?.firstName}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Document unclear, mismatched address…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReject(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doReject}>Reject KYC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
