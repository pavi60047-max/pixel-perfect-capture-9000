import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, Eyebrow, Glass, ScoreRing, StatusTag, IntegrityTag } from "@/components/hs";
import { finalScore, useStore } from "@/lib/hiresense";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HireSense AI – AI-Powered Job Matching & Skill Verification" },
      { name: "description", content: "Match candidates to the right jobs, verify their technical skills, and hire smarter — beyond the resume." },
      { property: "og:title", content: "HireSense AI – Match. Verify. Hire Smarter." },
      { property: "og:description", content: "Resume analysis, job matching, skill verification and integrity monitoring in one platform." },
    ],
  }),
  component: Index,
});

const steps = ["Upload resume", "Extract skills & experience", "Match to job", "10-question verification", "Final candidate score"];
const features = [
  ["Resume Analysis", "Parse PDFs and extract skills, education, experience and projects."],
  ["Job Matching Engine", "Compare candidate skills against requirements with a clear match score."],
  ["Skill-Gap Detection", "See matched and missing skills at a glance."],
  ["Skill Verification", "Timed 10-question technical assessment tailored to the role."],
  ["Integrity Monitoring", "Tab-switch and fullscreen-exit tracking during assessments."],
  ["Recruiter Dashboard", "Filter, sort, compare and shortlist with confidence."],
];

function Index() {
  const { candidates, jobs } = useStore();
  const top = [...candidates].sort((a, b) => finalScore(b) - finalScore(a)).slice(0, 4);
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-4 pt-10 md:px-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Glass className="p-8 md:p-11 lg:col-span-7">
            <Eyebrow>Match. Verify. Hire Smarter.</Eyebrow>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.03] tracking-tight md:text-6xl">AI-Powered Job Matching &amp; Skill Verification</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">Match candidates to the right jobs, verify their technical skills, and make smarter hiring decisions — beyond the resume.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/analyze" className="rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-brand transition hover:brightness-110">Analyze a Resume</Link>
              <Link to="/dashboard" className="rounded-full border border-border px-6 py-3 font-semibold text-secondary-foreground transition hover:bg-accent">Recruiter Dashboard</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <span>{candidates.length} candidates evaluated</span><span className="size-1 rounded-full bg-muted-foreground" />
              <span>{jobs.length} open roles</span><span className="size-1 rounded-full bg-muted-foreground" />
              <span>50% match · 50% verification</span>
            </div>
          </Glass>
          <Glass className="flex flex-col lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Match score</span>
              <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-xs text-success">Skills verified</span>
            </div>
            <div className="mt-4 grid place-items-center"><ScoreRing value={87} label="Strong Match" /></div>
            <div className="mt-5 space-y-3">
              {[["Java & Spring", 94], ["SQL & MongoDB", 81], ["Docker", 30]].map(([l, v]) => (
                <div key={l}><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{l}</span><span className={Number(v) > 60 ? "text-brand2" : ""}>{v}%</span></div><Bar value={Number(v)} muted={Number(v) < 60} /></div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-brand/20 bg-brand/10 p-4 text-sm text-secondary-foreground">
              <span className="font-semibold text-brand2">Ananya Sharma.</span> Matches 7 of 8 must-haves for Software Developer · Integrity clear.
            </div>
          </Glass>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 md:px-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Glass className="lg:col-span-5">
            <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-brand2 hs-pulse" /><span className="text-sm font-semibold">Assessment integrity monitoring is active</span></div>
            <div className="mt-4 rounded-2xl border border-border bg-ink/60 p-5 text-sm leading-relaxed">"Which clause filters rows after GROUP BY?"</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[["Tab switches", "0 times", "text-success"], ["Fullscreen exits", "0 times", "text-success"], ["Focus changes", "1 flagged", "text-warning"], ["Time left", "07:42", "text-brand2"]].map(([a, b, c]) => (
                <div key={a} className="rounded-xl border border-border bg-muted p-3"><div className="text-muted-foreground">{a}</div><div className={`mt-1 font-semibold ${c}`}>{b}</div></div>
              ))}
            </div>
          </Glass>
          <Glass className="lg:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <div><h3 className="text-lg font-bold">Candidate pipeline</h3><p className="text-xs text-muted-foreground">Ranked by final score</p></div>
              <Link to="/dashboard" className="rounded-full border border-brand/30 bg-brand/20 px-3 py-1.5 text-xs font-semibold text-brand2">Open dashboard</Link>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2 font-medium">Candidate</th><th className="font-medium">Final</th><th className="font-medium">Integrity</th><th className="font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-border">
                {top.map((c) => (
                  <tr key={c.id}><td className="py-3"><Link to="/candidates/$id" params={{ id: c.id }} className="font-semibold hover:text-brand2">{c.name}</Link><div className="text-xs text-muted-foreground">{jobs.find((j) => j.id === c.jobId)?.title}</div></td>
                    <td className="font-bold text-brand2">{finalScore(c)}%</td><td><IntegrityTag i={c.integrity} /></td><td><StatusTag s={c.status} /></td></tr>
                ))}
              </tbody>
            </table>
          </Glass>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Features</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map(([t, d], i) => <Glass key={t} className="p-6"><div className="text-xs text-brand2">0{i + 1}</div><h3 className="mt-2 font-bold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></Glass>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <div className="grid gap-4 lg:grid-cols-12">
          <Glass className="lg:col-span-7">
            <h2 className="text-2xl font-extrabold">How it works</h2>
            <ol className="mt-5 space-y-3">
              {steps.map((s, i) => <li key={s} className="flex items-center gap-4"><span className="grid size-8 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">{i + 1}</span><span>{s}</span></li>)}
            </ol>
          </Glass>
          <Glass className="lg:col-span-5">
            <h2 className="text-2xl font-extrabold">Why HireSense AI</h2>
            <p className="mt-4 text-muted-foreground">"Don't just match the resume. Match the candidate to the job and verify whether they can demonstrate the required skills."</p>
            <Link to="/jobs" className="mt-6 inline-block rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand">Post a job as recruiter</Link>
          </Glass>
        </div>
      </section>
    </>
  );
}
