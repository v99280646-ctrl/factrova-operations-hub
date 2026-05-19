import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import factrovaLogo from "@/images/tfacrova logo.png";
import whiteFactrovaLogo from "@/images/white facrova logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Factrova - Login" },
      { name: "description", content: "Sign in to manage your factory operations with Factrova." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loginRole, setLoginRole] = useState<"admin" | "employee">("admin");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("factrova-login-role", loginRole);
    if (loginRole === "employee") {
      localStorage.setItem("factrova-employee-name", "Anoop K");
      localStorage.setItem("factrova-employee-position", "Cutting Mechine");
    } else {
      localStorage.removeItem("factrova-employee-name");
      localStorage.removeItem("factrova-employee-position");
    }
    navigate({ to: loginRole === "employee" ? "/employee/dashboard" : "/admin/dashboard" });
  };

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-[1.05fr_0.95fr]">
      <section
        className="hidden min-h-screen flex-col justify-between px-10 py-9 text-primary-foreground md:flex lg:px-14"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      >
        <div className="flex flex-col items-start gap-2">
          <img src={whiteFactrovaLogo} alt="Factrova" className="h-16 w-auto object-contain" />
          <span className="text-2xl font-bold tracking-tight text-primary-foreground">Factrova</span>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
            Factory operations
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
            Control projects, stock and teams from one workspace.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-primary-foreground/80">
            Track production progress, material movement and finance without jumping between tools.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { k: "120+", v: "Active projects" },
            { k: "Rs 4.2Cr", v: "Quarterly revenue" },
            { k: "98%", v: "On-time delivery" },
          ].map((stat) => (
            <div key={stat.v} className="border-l border-white/30 pl-4">
              <p className="text-xl font-bold">{stat.k}</p>
              <p className="mt-1 text-primary-foreground/75">{stat.v}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="flex min-h-screen items-center px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex flex-col items-center justify-center gap-2 md:hidden">
            <img src={factrovaLogo} alt="Factrova" className="h-16 w-auto object-contain" />
            <span className="text-2xl font-bold tracking-tight text-foreground">Factrova</span>
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
                <Input id="password" type="password" placeholder="Password" className="h-11 pl-10" />
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
      </main>
    </div>
  );
}
