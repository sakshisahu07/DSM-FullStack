import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { allRoutes } from "@/lib/nav";
import { products, orders, users, affiliates } from "@/lib/mock-data";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const go = (url: string) => {
    onOpenChange(false);
    navigate({ to: url });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, orders, products, users…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {allRoutes.map((r) => (
            <CommandItem key={r.url} onSelect={() => go(r.url)} value={`${r.group} ${r.title}`}>
              <span className="text-muted-foreground text-xs mr-2">{r.group}</span>
              {r.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Recent Orders">
          {orders.slice(0, 6).map((o) => (
            <CommandItem key={o.id} onSelect={() => go("/orders/all")} value={`${o.id} ${o.customer}`}>
              <span className="font-mono text-xs mr-2">{o.id}</span>
              {o.customer} · ₹{o.total}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Products">
          {products.slice(0, 6).map((p) => (
            <CommandItem key={p.id} onSelect={() => go("/products/all")} value={`${p.sku} ${p.name}`}>
              <span className="font-mono text-xs mr-2">{p.sku}</span>
              {p.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Users">
          {users.slice(0, 5).map((u) => (
            <CommandItem key={u.id} onSelect={() => go("/users/all")} value={`${u.name} ${u.phone} ${u.email}`}>
              {u.name} · {u.phone}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Affiliates">
          {affiliates.slice(0, 5).map((a) => (
            <CommandItem key={a.id} onSelect={() => go("/affiliate/all")} value={`${a.name} ${a.referralCode}`}>
              {a.name} · <span className="font-mono text-xs ml-1">{a.referralCode}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
