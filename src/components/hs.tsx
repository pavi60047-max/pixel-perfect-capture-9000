import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed -top-56 -left-56 size-[620px] rounded-full bg-brand/25 blur-[140px]" />
      <div className="pointer-events-none fixed top-1/3 -right-40 size-[520px] rounded-full bg-brand2/20 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-40 left-1/4 size-[460px] rounded-full bg-brand3/20 blur-[140px]" />
      <header className="relative z-30 flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 shadow-brand">
            <span className="text-sm font-extrabold text-primary-foreground">H</span>
          </div>
          <span className="text-lg font-bold tracking-tight">HireSense<span className="text-brand2"> AI</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {([["/analyze", "Analyzer"], ["/jobs", "Jobs"], ["/dashboard", "Dashboard"]] as const).map(([to, l]) => (
            <Link key={to} to={to} className="transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>{l}</Link>
          ))}
        </nav>
        <Link to="/analyze" className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90">Analyze a Resume</Link>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 flex flex-col items-center justify-between gap-3 border-t border-border px-6 py-6 text-xs text-muted-foreground md:flex-row md:px-10">
        <span>© 2026 HireSense AI · Match. Verify. Hire Smarter.</span>
        <span className="flex gap-6"><span>Privacy</span><span>Security</span><span>Fair hiring</span></span>
      </footer>
    </div>
  );
}

export const Glass = ({ className, children }: { className?: string; children: ReactNode }) =>
  <div className={cn("glass hs-rise p-7", className)}>{children}</div>;

export const Eyebrow = ({ children }: { children: ReactNode }) =>
  <span className="inline-flex items-center gap-2 rounded-full border border-brand2/20 bg-brand2/10 px-3 py-1 text-xs font-medium text-brand2">{children}</span>;

export function Btn({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return <button {...p} className={cn("rounded-full px-6 py-3 text-sm font-semibold transition disabled:opacity-50",
    variant === "primary" && "bg-gradient-brand text-primary-foreground shadow-brand hover:brightness-110",
    variant === "ghost" && "border border-border text-secondary-foreground hover:bg-accent",
    variant === "danger" && "border border-danger/30 text-danger hover:bg-danger/10", className)} />;
}

export const SkillBadge = ({ s, tone = "brand" }: { s: string; tone?: "brand" | "ok" | "miss" }) => (
  <span className={cn("rounded-full border px-3 py-1 text-xs font-medium",
    tone === "brand" && "border-brand/30 bg-brand/15 text-brand2",
    tone === "ok" && "border-success/25 bg-success/10 text-success",
    tone === "miss" && "border-danger/25 bg-danger/10 text-danger")}>
    {tone === "ok" ? "✓ " : tone === "miss" ? "× " : ""}{s}
  </span>
);

export function ScoreRing({ value, label, size = 176 }: { value: number; label?: string; size?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 80); return () => clearTimeout(t); }, [value]);
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <defs><linearGradient id="hsg" x1="0" x2="1"><stop offset="0" stopColor="var(--brand)" /><stop offset="1" stopColor="var(--brand2)" /></linearGradient></defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#hsg)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="text-4xl font-extrabold">{value}<span className="text-xl text-muted-foreground">%</span></div>
          {label && <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>}</div>
      </div>
    </div>
  );
}

export const Bar = ({ value, muted }: { value: number; muted?: boolean }) => (
  <div className="h-1.5 rounded-full bg-muted"><div className={cn("h-full rounded-full", muted ? "bg-muted-foreground/50" : "bg-gradient-brand")} style={{ width: `${value}%` }} /></div>
);

export const IntegrityTag = ({ i }: { i: string }) => (
  <span className={cn("text-xs font-semibold", i === "Clear" ? "text-success" : i === "Flagged" ? "text-danger" : "text-muted-foreground")}>{i}</span>
);
export const StatusTag = ({ s }: { s: string }) => (
  <span className={cn("rounded-full px-2 py-0.5 text-xs", s === "Shortlisted" ? "bg-brand/20 text-brand2" : s === "Rejected" ? "bg-danger/15 text-danger" : s === "Under Review" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>{s}</span>
);
export const inputCls = "w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand2";
