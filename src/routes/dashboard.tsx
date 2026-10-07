import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Glass, IntegrityTag, StatusTag, inputCls } from "@/components/hs";
import { actions, finalScore, useStore } from "@/lib/hiresense";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Recruiter Dashboard – HireSense AI" },
      { name: "description", content: "Analytics, candidate rankings, integrity flags and shortlisting." },
      { property: "og:title", content: "Recruiter Dashboard – HireSense AI" },
      { property: "og:description", content: "Rank, filter, compare and shortlist candidates." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { candidates, jobs } = useStore();
  const [q, setQ] = useState(""); const [job, setJob] = useState(""); const [status, setStatus] = useState("");
  const [integ, setInteg] = useState(""); const [min, setMin] = useState(0); const [desc, setDesc] = useState(true);
  const [cmp, setCmp] = useState<string[]>([]);
  const avg = (xs: number[]) => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
  const done = candidates.filter((c) => c.quiz != null);
  const stats = [
    ["Total Candidates", candidates.length], ["Total Jobs", jobs.length], ["Average Match", `${avg(candidates.map((c) => c.match))}%`],
    ["Shortlisted", candidates.filter((c) => c.status === "Shortlisted").length], ["Assessments Completed", done.length],
    ["Average Skill Score", `${avg(done.map((c) => c.quiz!))}%`], ["Flagged Assessments", candidates.filter((c) => c.integrity === "Flagged").length],
  ];
  const rows = candidates
    .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) && (!job || c.jobId === job) && (!status || c.status === status) && (!integ || c.integrity === integ) && finalScore(c) >= min)
    .sort((a, b) => (desc ? 1 : -1) * (finalScore(b) - finalScore(a)));
  const compared = candidates.filter((c) => cmp.includes(c.id));

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-6 md:px-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {stats.map(([l, v], k) => <Glass key={l} className="p-5"><div className={cn("text-2xl font-extrabold", k === 6 ? "text-danger" : k === 3 ? "text-brand2" : "")}>{v}</div><div className="mt-1 text-xs text-muted-foreground">{l}</div></Glass>)}
      </div>

      <Glass className="mt-4">
        <div className="grid gap-3 md:grid-cols-6">
          <input className={cn(inputCls, "md:col-span-2")} placeholder="Search candidates…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls} value={job} onChange={(e) => setJob(e.target.value)}><option value="">All jobs</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{["Shortlisted", "Under Review", "Assessment Pending", "Rejected"].map((s) => <option key={s}>{s}</option>)}</select>
          <select className={inputCls} value={integ} onChange={(e) => setInteg(e.target.value)}><option value="">All integrity</option>{["Clear", "Flagged", "Pending"].map((s) => <option key={s}>{s}</option>)}</select>
          <select className={inputCls} value={min} onChange={(e) => setMin(Number(e.target.value))}>{[0, 60, 75, 90].map((n) => <option key={n} value={n}>{n ? `Score ≥ ${n}` : "Any score"}</option>)}</select>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-2" /><th className="pr-4">Candidate</th><th className="pr-4">Job</th><th className="pr-4">Match</th><th className="pr-4">Skill Score</th>
              <th className="cursor-pointer pr-4 text-brand2" onClick={() => setDesc(!desc)}>Final Score {desc ? "↓" : "↑"}</th><th className="pr-4">Integrity</th><th className="pr-4">Status</th><th>Actions</th></tr></thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 pr-2"><input type="checkbox" checked={cmp.includes(c.id)} onChange={() => setCmp((x) => x.includes(c.id) ? x.filter((y) => y !== c.id) : [...x, c.id].slice(-3))} /></td>
                  <td className="pr-4"><div className="font-semibold">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></td>
                  <td className="pr-4 text-muted-foreground">{jobs.find((j) => j.id === c.jobId)?.title}</td>
                  <td className="pr-4">{c.match}%</td><td className="pr-4">{c.quiz == null ? "—" : `${c.quiz}%`}</td>
                  <td className="pr-4 font-bold text-brand2">{finalScore(c)}%</td><td className="pr-4"><IntegrityTag i={c.integrity} /></td><td className="pr-4"><StatusTag s={c.status} /></td>
                  <td className="whitespace-nowrap text-xs">
                    <Link to="/candidates/$id" params={{ id: c.id }} className="mr-3 text-brand2">View Profile</Link>
                    <button className="mr-3 text-success" onClick={() => actions.updateCandidate(c.id, { status: "Shortlisted" })}>Shortlist</button>
                    <button className="text-danger" onClick={() => actions.updateCandidate(c.id, { status: "Rejected" })}>Reject</button>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No candidates match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Glass>

      {compared.length > 1 && (
        <Glass className="mt-4">
          <h2 className="text-lg font-bold">Compare candidates</h2>
          <div className={cn("mt-4 grid gap-4", compared.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
            {compared.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-muted p-5">
                <div className="font-bold">{c.name}</div>
                <div className="mt-3 space-y-1 text-sm">
                  <div>Match: <b>{c.match}%</b></div><div>Skill: <b>{c.quiz ?? "—"}{c.quiz != null && "%"}</b></div>
                  <div>Final: <b className="text-brand2">{finalScore(c)}%</b></div><div>Integrity: <IntegrityTag i={c.integrity} /></div>
                  <div className="text-xs text-danger">Gaps: {c.missing.join(", ") || "None"}</div>
                </div>
              </div>
            ))}
          </div>
        </Glass>
      )}
    </section>
  );
}
