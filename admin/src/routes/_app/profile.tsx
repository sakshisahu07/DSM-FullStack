import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/stats-card";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { StatsSkeleton, FormSkeleton } from "@/components/loading-skeletons";
import {
  User, Mail, Phone, MapPin, Shield, Camera, KeyRound, Bell, Activity, Save,
  CheckCircle2, Package, Trophy,
} from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const loading = useFakeLoading();

  const [profile, setProfile] = useState({
    name: "Admin User",
    role: "Super Administrator",
    email: "admin@dsmelectro.in",
    phone: "+91 98765 43210",
    location: "Bengaluru, Karnataka",
    bio: "Managing the DSM Electro storefront, catalog and operations team.",
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: false,
  });

  const [notifications, setNotifications] = useState({
    orders: true,
    inventory: true,
    marketing: false,
    weeklyReport: true,
  });

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onSave = () => toast.success("Profile updated");
  const onChangePassword = () => toast.info("Password reset link sent to your email");

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your account, security and notification preferences."
        actions={
          <Button className="gap-1.5" onClick={onSave}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        }
      />

      {loading ? (
        <>
          <StatsSkeleton count={4} />
          <FormSkeleton fields={6} />
        </>
      ) : (
        <>
          {/* Identity card */}
          <Card className="p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                onClick={() => toast.info("Photo upload coming soon")}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" /> {profile.role}
                </Badge>
                <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {profile.email}</span>
                <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {profile.phone}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Orders Managed" value="1,284" icon={Package} tone="primary" />
            <StatsCard label="Active Sessions" value="3" icon={Activity} tone="default" />
            <StatsCard label="Achievements" value="12" icon={Trophy} tone="success" />
            <StatsCard label="Last Login" value="2h ago" icon={Shield} tone="default" />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general"><User className="h-4 w-4 mr-1.5" /> General</TabsTrigger>
              <TabsTrigger value="security"><KeyRound className="h-4 w-4 mr-1.5" /> Security</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" /> Notifications</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="h-4 w-4 mr-1.5" /> Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <Card className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={onSave} className="gap-1.5"><Save className="h-4 w-4" /> Save changes</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <Card className="p-6 space-y-5">
                <div>
                  <h3 className="font-semibold">Password</h3>
                  <p className="text-sm text-muted-foreground mb-3">Last changed 32 days ago.</p>
                  <Button variant="outline" onClick={onChangePassword} className="gap-1.5">
                    <KeyRound className="h-4 w-4" /> Change password
                  </Button>
                </div>
                <Separator />
                <ToggleRow
                  title="Two-factor authentication"
                  desc="Require an authenticator code on every login."
                  checked={security.twoFactor}
                  onChange={(v) => setSecurity({ ...security, twoFactor: v })}
                />
                <ToggleRow
                  title="Login alerts"
                  desc="Email me whenever a new device signs in."
                  checked={security.loginAlerts}
                  onChange={(v) => setSecurity({ ...security, loginAlerts: v })}
                />
                <ToggleRow
                  title="Auto session timeout"
                  desc="Sign me out automatically after 30 minutes of inactivity."
                  checked={security.sessionTimeout}
                  onChange={(v) => setSecurity({ ...security, sessionTimeout: v })}
                />
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <Card className="p-6 space-y-5">
                <ToggleRow title="New orders" desc="Get notified when an order is placed." checked={notifications.orders} onChange={(v) => setNotifications({ ...notifications, orders: v })} />
                <ToggleRow title="Inventory alerts" desc="Low stock and out-of-stock warnings." checked={notifications.inventory} onChange={(v) => setNotifications({ ...notifications, inventory: v })} />
                <ToggleRow title="Marketing updates" desc="Product updates and announcements." checked={notifications.marketing} onChange={(v) => setNotifications({ ...notifications, marketing: v })} />
                <ToggleRow title="Weekly report" desc="Summary of sales and store performance every Monday." checked={notifications.weeklyReport} onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })} />
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card className="p-0 overflow-hidden">
                <div className="divide-y">
                  {[
                    { t: "Updated product 'Arduino Uno R3'", time: "2 hours ago" },
                    { t: "Approved KYC for affiliate Rohan K.", time: "5 hours ago" },
                    { t: "Created invoice INV-2026-0147", time: "Yesterday" },
                    { t: "Changed password", time: "32 days ago" },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors">
                      <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{a.t}</div>
                        <div className="text-xs text-muted-foreground">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function ToggleRow({
  title, desc, checked, onChange,
}: {
  title: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-medium text-sm">{title}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
