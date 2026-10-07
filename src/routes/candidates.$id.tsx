import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Glass, IntegrityTag, ScoreRing, SkillBadge, StatusTag } from "@/components/hs";
import { actions, finalScore, recommendation, useStore } from "@/lib/hiresense";

export const Route = createFileRoute("/candidates/$id")({
  head: () => ({
    meta: [
      { title: "Candidate Profile – HireSense AI" },
      { name: "description", content: "Detailed candidate evaluation: match, verification, integrity and skill gaps." },
      { property: "og:title", content: "Candidate Profile – HireSense AI" },
      { property: "og:description", content: "Candidate scores, skills and recommendation." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { id } = Route.useParams();
  const { candidates, jobs } = useStore();
  const c = candidates.find((x) => x.id === id);
  if (!c) return <div className="p-20 text-center">Candidate not found. <Link to="/dashboard" className="text-brand2">Back</Link></div>;
  const f = finalScore(c);
  const job = jobs.find((j) => j.id === c.jobId);
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-6 md:px-10">
      <div className="grid gap-4 lg:grid-cols-12">
        <Glass className="lg:col-span-7">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-brand to-brand2 text-lg font-bold text-primary-foreground">{c.name.split(" ").map((p) => p[0]).join("")}</div>
            <div><h1 className="text-2xl font-extrabold">{c.name}</h1><div className="text-sm text-muted-foreground">{c.email} · {job?.title} · {c.resumeName}</div></div>
            <div className="ml-auto"><StatusTag s={c.status} /></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Resume Match", `${c.match}%`], ["Skill Verification", c.quiz == null ? "—" : `${c.quiz}%`], ["Final Score", `${f}%`]].map(([a, b]) => (
              <div key={a} className="rounded-2xl border border-border bg-muted p-4"><div className="text-xs text-muted-foreground">{a}</div><div className="mt-1 text-xl font-bold">{b}</div></div>
            ))}
            <div className="rounded-2xl border border-border bg-muted p-4"><div className="text-xs text-muted-foreground">Integrity</div><div className="mt-1 text-xl"><IntegrityTag i={c.integrity} /></div></div>
          </div>
          {[["Skills", c.skills, "brand"], ["Matched skills", c.matched, "ok"], ["Skill gaps", c.missing, "miss"]].map(([t, list, tone]) => (
            <div key={t as string} className="mt-6"><div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{t as string}</div>
              <div className="flex flex-wrap gap-2">{(list as string[]).length ? (list as string[]).map((s) => <SkillBadge key={s} s={s} tone={tone as "ok"} />) : <span className="text-sm text-muted-foreground">None</span>}</div></div>
          ))}
          {c.events.length > 0 && <div className="mt-6 rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">Suspicious activity detected: {c.events.join(", ")}</div>}
        </Glass>
        <Glass className="flex flex-col items-center text-center lg:col-span-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Final candidate score</div>
          <div className="mt-4"><ScoreRing value={f} size={200} /></div>
          <div className="mt-5 rounded-2xl border border-brand/20 bg-brand/10 p-4 text-sm"><span className="font-semibold text-brand2">Recommendation.</span> {recommendation(f)}</div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Btn onClick={() => actions.updateCandidate(c.id, { status: "Shortlisted" })}>Shortlist</Btn>
            <Btn variant="ghost" onClick={() => actions.updateCandidate(c.id, { status: "Under Review" })}>Review</Btn>
            <Btn variant="danger" onClick={() => actions.updateCandidate(c.id, { status: "Rejected" })}>Reject</Btn>
          </div>
          {c.quiz == null && <Link to="/assessment/$id" params={{ id: c.id }} className="mt-4 text-sm text-brand2">Start skill verification →</Link>}
        </Glass>
      </div>
    </section>
  );
}
