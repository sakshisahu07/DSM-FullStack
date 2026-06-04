import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, History, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_app/refer-earn")({
  component: ReferAndEarnSettings,
});

interface AppReferralConfig {
  isActive: boolean;
  referrerRewardCoins: number;
  referredRewardCoins: number;
  referrerSignupWalletReward: number;
  referredSignupWalletReward: number;
  dynamicLinkDomain: string;
  androidPackageName: string;
}

interface Transaction {
  _id: string;
  referrerId: { firstName: string; lastName: string; email: string };
  referredUserId: { firstName: string; lastName: string; email: string };
  referrerCoinsAwarded: number;
  referredCoinsAwarded: number;
  referrerWalletAwarded: number;
  referredWalletAwarded: number;
  status: string;
  createdAt: string;
}

function ReferAndEarnSettings() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AppReferralConfig>({
    isActive: true,
    referrerRewardCoins: 500,
    referredRewardCoins: 100,
    referrerSignupWalletReward: 0,
    referredSignupWalletReward: 0,
    dynamicLinkDomain: "",
    androidPackageName: "",
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchConfig = async () => {
    try {
      const res = await apiFetch("/admin/app-referral/config");
      const json = await res.json();
      if (json.success && json.data) {
        setConfig(json.data);
      }
    } catch (error) {
      toast.error("Failed to load config");
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await apiFetch("/admin/app-referral/transactions");
      const json = await res.json();
      if (json.success && json.data) {
        setTransactions(json.data);
      }
    } catch (error) {
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchTransactions();
  }, []);

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/admin/app-referral/config", {
        method: "PUT",
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Refer & Earn config updated!");
      } else {
        toast.error(json.message || "Failed to update config");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="App Refer & Earn Settings"
        subtitle="Configure the global Refer & Earn rewards and view referral transactions."
      />

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" /> Configuration
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <History className="w-4 h-4" /> Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Reward Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <Label>Enable App Refer & Earn</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle the global refer and earn system on or off.
                  </p>
                </div>
                <Switch
                  checked={config.isActive}
                  onCheckedChange={(c) => setConfig({ ...config, isActive: c })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Referrer Reward (Coins)</Label>
                  <Input
                    type="number"
                    value={config.referrerRewardCoins}
                    onChange={(e) => setConfig({ ...config, referrerRewardCoins: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Coins given to referrer on 1st purchase.</p>
                </div>

                <div className="space-y-2">
                  <Label>Referred User Bonus (Coins)</Label>
                  <Input
                    type="number"
                    value={config.referredRewardCoins}
                    onChange={(e) => setConfig({ ...config, referredRewardCoins: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Coins given to new user on 1st purchase.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Referrer Signup Reward (₹ Wallet)</Label>
                  <Input
                    type="number"
                    value={config.referrerSignupWalletReward}
                    onChange={(e) => setConfig({ ...config, referrerSignupWalletReward: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Wallet money given instantly to referrer on signup.</p>
                </div>

                <div className="space-y-2">
                  <Label>Referred User Signup Reward (₹ Wallet)</Label>
                  <Input
                    type="number"
                    value={config.referredSignupWalletReward}
                    onChange={(e) => setConfig({ ...config, referredSignupWalletReward: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Wallet money given instantly to new user on signup.</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm">Firebase Dynamic Links Config (Optional)</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Dynamic Link Domain</Label>
                    <Input
                      placeholder="e.g. dsmelectro.page.link"
                      value={config.dynamicLinkDomain}
                      onChange={(e) => setConfig({ ...config, dynamicLinkDomain: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Android Package Name</Label>
                    <Input
                      placeholder="e.g. com.dsmelectro.app"
                      value={config.androidPackageName}
                      onChange={(e) => setConfig({ ...config, androidPackageName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveConfig} disabled={loading} className="gap-2">
                  <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rewards Awarded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell className="text-sm">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {t.referrerId?.firstName} {t.referrerId?.lastName}
                          <div className="text-xs text-muted-foreground">{t.referrerId?.email}</div>
                        </TableCell>
                        <TableCell>
                          {t.referredUserId?.firstName} {t.referredUserId?.lastName}
                          <div className="text-xs text-muted-foreground">{t.referredUserId?.email}</div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge variant={t.status === "REWARDED" ? "success" : "warning"}>
                            {t.status}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">Referrer: ₹{t.referrerWalletAwarded || 0} / {t.referrerCoinsAwarded} Coins</div>
                          <div className="text-sm font-medium text-muted-foreground">Referred: ₹{t.referredWalletAwarded || 0} / {t.referredCoinsAwarded} Coins</div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
