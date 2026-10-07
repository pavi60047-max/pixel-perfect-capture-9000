import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Btn, Glass, ScoreRing, IntegrityTag } from "@/components/hs";
import { actions, buildQuiz, finalScore, recommendation, useStore } from "@/lib/hiresense";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment/$id")({
  head: () => ({
    meta: [
      { title: "Skill Verification Assessment – HireSense AI" },
      { name: "description", content: "Timed 10-question technical assessment with integrity monitoring." },
      { property: "og:title", content: "Skill Verification – HireSense AI" },
      { property: "og:description", content: "Prove your skills with a timed, monitored assessment." },
    ],
  }),
  component: Assessment,
});

function Assessment() {
  const { id } = Route.useParams();
  const { candidates, jobs } = useStore();
  const c = candidates.find((x) => x.id === id);
  const job = jobs.find((j) => j.id === c?.jobId);
  const quiz = useMemo(() => buildQuiz([...(c?.skills ?? []), ...(job?.skills ?? [])]), [c?.id]);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<(number | null)[]>(Array(10).fill(null));
  const [time, setTime] = useState(600);
  const [events, setEvents] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const ref = useRef({ events, ans });
  ref.current = { events, ans };

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setTime((s) => { if (s <= 1) { submit(); return 0; } return s - 1; }), 1000);
    const log = (e: string) => setEvents((x) => [...x, e]);
    const vis = () => document.hidden && log("Left assessment tab");
    const fs = () => !document.fullscreenElement && log("Exited fullscreen");
    const blur = () => log("Window focus lost");
    document.addEventListener("visibilitychange", vis);
    document.addEventListener("fullscreenchange", fs);
    window.addEventListener("blur", blur);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); document.removeEventListener("fullscreenchange", fs); window.removeEventListener("blur", blur); };
  }, [started, done]);

  if (!c) return <div className="p-20 text-center">Candidate not found. <Link to="/analyze" className="text-brand2">Analyze a resume</Link></div>;

  function start() { document.documentElement.requestFullscreen?.().catch(() => {}); setStarted(true); }
  function submit() {
    const { events, ans } = ref.current;
    const correct = quiz.filter((q, k) => ans[k] === q.answer).length;
    const flagged = events.length >= 2;
    actions.updateCandidate(c!.id, { quiz: correct * 10, events, integrity: flagged ? "Flagged" : "Clear", status: "Under Review" });
    setDone(true);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  if (done && c.quiz != null) {
    const f = finalScore(c);
    return (
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-6">
        <Glass className="text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Final candidate score</div>
          <div className="mt-4 grid place-items-center"><ScoreRing value={f} size={200} label="50% match + 50% quiz" /></div>
          <p className="mt-4 text-lg font-semibold text-brand2">{recommendation(f)}</p>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {[["Resume Match", `${c.match}%`], ["Quiz Score", `${c.quiz / 10} / 10 · ${c.quiz}%`], ["Integrity", c.integrity], ["Final Score", `${f}%`]].map(([a, b]) => (
              <div key={a} className="rounded-2xl border border-border bg-muted p-4"><div className="text-xs text-muted-foreground">{a}</div><div className="mt-1 text-xl font-bold">{a === "Integrity" ? <IntegrityTag i={b} /> : b}</div></div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/candidates/$id" params={{ id: c.id }} className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand">View profile</Link>
            <Link to="/dashboard" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">Recruiter dashboard</Link>
          </div>
        </Glass>
      </section>
    );
  }

  if (!started) return (
    <section className="mx-auto max-w-3xl px-6 pb-16 pt-6">
      <Glass>
        <h1 className="text-3xl font-extrabold">Skill Verification for {c.name}</h1>
        <p className="mt-3 text-muted-foreground">10 multiple-choice questions based on your skills and the {job?.title} role. You have 10 minutes.</p>
        <ul className="mt-5 space-y-2 text-sm text-secondary-foreground">
          <li>• Assessment integrity monitoring is active during the test.</li>
          <li>• Leaving the tab, exiting fullscreen, or repeated focus changes are recorded.</li>
          <li>• Monitoring flags suspicious activity; it does not guarantee detection of every form of misconduct.</li>
        </ul>
        <Btn className="mt-6" onClick={start}>Start Assessment</Btn>
      </Glass>
    </section>
  );

  const q = quiz[i];
  const answered = ans.filter((a) => a != null).length;
  const flagged = events.length >= 2;
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-6 md:px-10">
      <div className="grid gap-4 lg:grid-cols-12">
        <Glass className="lg:col-span-8">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Question {i + 1} of 10 · <span className="text-brand2">{q.skill}</span></span>
            <span className={cn("rounded-full px-3 py-1 font-mono font-bold", time < 60 ? "bg-danger/15 text-danger" : "bg-brand/20 text-brand2")}>{String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${answered * 10}%` }} /></div>
          <div className="mt-1 text-right text-xs text-muted-foreground">{answered * 10}% answered</div>
          <h2 className="mt-6 text-xl font-bold leading-snug">{q.q}</h2>
          <div className="mt-5 grid gap-3">
            {q.options.map((o, k) => (
              <button key={k} onClick={() => setAns((a) => a.map((v, n) => n === i ? k : v))}
                className={cn("rounded-2xl border p-4 text-left text-sm transition", ans[i] === k ? "border-brand2 bg-brand2/10" : "border-border bg-muted hover:bg-accent")}>
                <span className="mr-3 font-bold text-muted-foreground">{"ABCD"[k]}</span>{o}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Btn variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</Btn>
            {i < 9 ? <Btn onClick={() => setI(i + 1)}>Next</Btn> : <Btn onClick={submit}>Submit Assessment</Btn>}
          </div>
        </Glass>
        <div className="space-y-4 lg:col-span-4">
          <Glass>
            <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-brand2 hs-pulse" /><span className="text-sm font-semibold">Monitoring Active</span></div>
            <div className="mt-4 text-xs text-muted-foreground">Integrity status</div>
            <div className={cn("mt-1 text-2xl font-extrabold", flagged ? "text-danger" : "text-success")}>{flagged ? "FLAGGED" : "CLEAR"}</div>
            {events.length > 0 && <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">Suspicious activity detected: {events[events.length - 1]}</div>}
            <ul className="mt-4 space-y-1 text-xs text-muted-foreground">{events.map((e, k) => <li key={k}>• {e}</li>)}</ul>
          </Glass>
          <Glass>
            <div className="grid grid-cols-5 gap-2">
              {quiz.map((_, k) => <button key={k} onClick={() => setI(k)} className={cn("rounded-lg py-2 text-xs font-bold", k === i ? "bg-gradient-brand text-primary-foreground" : ans[k] != null ? "bg-brand/20 text-brand2" : "bg-muted text-muted-foreground")}>{k + 1}</button>)}
            </div>
          </Glass>
        </div>
      </div>
    </section>
  );
}
