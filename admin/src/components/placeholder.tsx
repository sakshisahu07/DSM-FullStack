import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle ?? "This page is part of the foundation scaffold and ready for your detailed UI."} />
      <Card className="p-12 flex flex-col items-center text-center gap-3 border-dashed">
        <div className="h-12 w-12 rounded-lg bg-primary/10 grid place-items-center text-primary">
          <Construction className="h-6 w-6" />
        </div>
        <div className="font-medium">Coming up next</div>
        <p className="text-sm text-muted-foreground max-w-md">
          The route, layout, and navigation are wired. Tables, modals, and forms for this page can be built
          following the same pattern used in Products, Orders, Affiliates and KYC.
        </p>
      </Card>
    </div>
  );
}
