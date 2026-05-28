import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { orders } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/orders/tracker")({
  component: OrderTrackerPage,
});

const stages = ["placed", "confirmed", "processing", "shipping", "delivered"] as const;

function OrderTrackerPage() {
  const [q, setQ] = useState("");
  const order = orders.find((o) => o.id.toLowerCase().includes(q.toLowerCase())) ?? orders[0];
  const currentIdx = stages.indexOf(order.status as typeof stages[number]);

  return (
    <div className="space-y-6">
      <PageHeader title="Order Tracker" subtitle="Look up any order by ID and see its full timeline." />

      <Card className="p-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter order ID e.g. ORD-10234" className="pl-9" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-5 border-b">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Order</div>
            <div className="text-xl font-semibold">{order.id}</div>
            <div className="text-sm text-muted-foreground mt-1">{order.customer} • {order.items} items</div>
          </div>
          <Badge className="bg-primary text-primary-foreground capitalize">{order.status}</Badge>
        </div>

        <div className="pt-6">
          <div className="relative flex justify-between">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
            <div className="absolute top-4 left-0 h-0.5 bg-primary transition-all" style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }} />
            {stages.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2 w-1/5">
                <div className={`h-8 w-8 rounded-full grid place-items-center border-2 ${i <= currentIdx ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"}`}>
                  {i < currentIdx ? <CheckCircle2 className="h-4 w-4" /> : i === currentIdx ? <Truck className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </div>
                <div className={`text-xs capitalize ${i <= currentIdx ? "font-medium" : "text-muted-foreground"}`}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 text-sm">
          <Info label="Carrier" value="DSM Express" />
          <Info label="AWB" value="DSE9923847" />
          <Info label="ETA" value="2 days" />
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
