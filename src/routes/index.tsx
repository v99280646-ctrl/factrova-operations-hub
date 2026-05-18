import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Factory, Phone, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Factrova — Login" },
      { name: "description", content: "Sign in to manage your factory operations with Factrova." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loginRole, setLoginRole] = useState<"admin" | "employee">("admin");
  const [employeeName, setEmployeeName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("factrova-login-role", loginRole);
    if (loginRole === "employee") {
      localStorage.setItem("factrova-employee-name", employeeName.trim() || "Employee");
    } else {
      localStorage.removeItem("factrova-employee-name");
    }
    navigate({ to: loginRole === "employee" ? "/employee/dashboard" : "/admin/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Decorative gradient */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 10%, color-mix(in oklab, var(--primary) 25%, transparent) 0%, transparent 60%), radial-gradient(50% 40% at 10% 90%, color-mix(in oklab, var(--primary-glow) 20%, transparent) 0%, transparent 60%)",
        }}
      />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)] md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between p-10 text-primary-foreground md:flex" style={{ backgroundImage: "var(--gradient-primary)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Factory className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Factrova</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Run your factory like a Fortune 500.
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/85">
              Projects, stock, customers, vendors and finance — unified in one
              elegant workspace built for modern manufacturing teams.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { k: "120+", v: "Active projects" },
              { k: "₹4.2Cr", v: "Quarterly revenue" },
              { k: "98%", v: "On-time delivery" },
            ].map((s) => (
              <div key={s.v} className="rounded-lg bg-white/10 p-3 backdrop-blur">
                <p className="text-lg font-bold">{s.k}</p>
                <p className="opacity-85">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your Factrova workspace
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label>Login as</Label>
              <div className="grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1">
                {(["admin", "employee"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setLoginRole(role)}
                    className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                      loginRole === role
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {loginRole === "employee" && (
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input
                  id="employeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Enter employee name"
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit phone number"
                  className="h-11 pl-10"
                />
              </div>
            </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="h-11 pl-10" />
                </div>
              </div>

            <Button type="submit" className="h-11 w-full text-sm font-semibold" size="lg">
              Sign in
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to our{" "}
              <Link to="/" className="text-primary hover:underline">Terms</Link> &{" "}
              <Link to="/" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
