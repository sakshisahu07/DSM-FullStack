import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sun, Moon, ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Lottie from "lottie-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/lib/theme";
import logo from "@/assets/dsm-logo.png";
import animation from "@/assets/login-animation.json";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email address");
    if (password.length < 1) return toast.error("Password is required");
    
    localStorage.removeItem("dsm_token");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://api.dsmelectro.com/api/v1"}/auth/admin/registerLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();


      if (res.ok && json.success) {
        const token = json.token || json.data?.token || json.accessToken;
        if (token) {
          localStorage.setItem("dsm_token", token);
          if (remember) localStorage.setItem("dsm_remember", "1");
          toast.success(json.message || "Welcome back!");
          navigate({ to: "/dashboard" });
        } else {
          throw new Error("Token not found in response");
        }
      } else {

        throw new Error(json.message || "Invalid credentials");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
      
      // Fallback for demo purposes if the API is not reachable or returns error
      if (email === "admin@admin.com" && password === "admin") {
        localStorage.setItem("dsm_token", "demo-token");
        if (remember) localStorage.setItem("dsm_remember", "1");
        toast.info("Logged in with demo mode");
        navigate({ to: "/dashboard" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: brand panel with Lottie */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-primary/15 via-background to-background">
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top left, color-mix(in oklab, var(--primary) 25%, transparent), transparent 50%), radial-gradient(ellipse at bottom right, color-mix(in oklab, var(--info) 18%, transparent), transparent 50%)",
          }}
        />
        <div className="flex items-center gap-3">
          <img src={logo} className="h-10 w-10 rounded-lg bg-white p-1" alt="DSM Electro" />
          <div>
            <div className="font-semibold tracking-tight">DSM Electro</div>
            <div className="text-xs text-muted-foreground">Admin Console</div>
          </div>
        </div>

        <div className="space-y-5 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure email-based authentication
          </div>
          <div className="flex items-center justify-center -my-2">
            <Lottie animationData={animation} loop className="h-56 w-56" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Manage your electronics empire,
            <br />
            <span className="text-primary">end to end.</span>
          </h1>
          <p className="text-muted-foreground">
            Products, variants, marketing, orders, affiliates, payouts, KYC, B2B leads — everything in one focused workspace.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { k: "1.2k+", v: "Products" },
              { k: "8.4k", v: "Orders" },
              { k: "240", v: "Affiliates" },
            ].map((s) => (
              <div key={s.v} className="rounded-lg border bg-background/40 backdrop-blur p-3">
                <div className="text-lg font-semibold">{s.k}</div>
                <div className="text-[11px] text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} DSM Electro Pvt. Ltd.</div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 md:p-10 relative">
        <Button variant="ghost" size="icon" onClick={toggle} className="absolute top-4 right-4">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={logo} className="h-9 w-9 rounded-lg bg-white p-1" alt="DSM Electro" />
            <div className="font-semibold">DSM Electro Admin</div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter your email and password to continue</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a className="text-xs text-primary hover:underline cursor-pointer">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Remember me
              </label>
              <span className="text-xs text-muted-foreground">Demo: admin@admin.com / admin</span>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Signing in…" : (
                <>
                  Sign in <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t text-xs text-muted-foreground text-center">
            By continuing you agree to DSM Electro's <a className="underline">Terms</a> and <a className="underline">Privacy Policy</a>.
          </div>
        </Card>
      </div>
    </div>
  );
}
