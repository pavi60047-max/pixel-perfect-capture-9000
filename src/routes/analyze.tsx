import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Eyebrow, Glass, ScoreRing, SkillBadge, inputCls } from "@/components/hs";
import { actions, computeMatch, extractSections, extractSkills, matchCategory, uid, useStore, type Candidate } from "@/lib/hiresense";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Resume Analyzer – HireSense AI" },
      { name: "description", content: "Upload a PDF resume, extract skills and get an instant job match score." },
      { property: "og:title", content: "Resume Analyzer – HireSense AI" },
      { property: "og:description", content: "Instant resume analysis with matched and missing skills." },
    ],
  }),
  component: Analyze,
});

async function readPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const c = await page.getTextContent();
    text += c.items.map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : "")).join("") + "\n";
  }
  return text;
}

function Analyze() {
  const { jobs } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [jobId, setJobId] = useState(jobs[0]?.id ?? ""); const [custom, setCustom] = useState("");
  const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [result, setResult] = useState<Candidate | null>(null);

  async function run() {
    setErr("");
    if (!name || !email || !file) return setErr("Please fill in name, email and upload a PDF resume.");
    setBusy(true);
    try {
      const text = await readPdf(file);
      const skills = extractSkills(text);
      const job = jobs.find((j) => j.id === jobId);
      const required = jobId === "custom" ? extractSkills(custom) : job?.skills ?? [];
      const c: Candidate = { id: uid(), name, email, jobId: jobId === "custom" ? jobs[0]?.id : jobId, skills, ...extractSections(text),
        ...computeMatch(skills, required), quiz: null, integrity: "Pending", events: [], status: "Assessment Pending", resumeName: file.name };
      actions.addCandidate(c); setResult(c);
    } catch { setErr("Could not read this PDF. Try another file."); }
    setBusy(false);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-6 md:px-10">
      <Eyebrow>Resume Analyzer</Eyebrow>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Analyze a resume against a job</h1>
      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <Glass className="space-y-4 lg:col-span-5">
          <input className={inputCls} placeholder="Candidate name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputCls} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="block cursor-pointer rounded-2xl border border-dashed border-brand2/40 bg-brand2/5 p-6 text-center text-sm">
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <div className="font-semibold text-brand2">{file ? file.name : "Upload resume (PDF)"}</div>
            <div className="mt-1 text-xs text-muted-foreground">Click to choose a file</div>
          </label>
          <select className={inputCls} value={jobId} onChange={(e) => setJobId(e.target.value)}>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            <option value="custom">Paste a custom job description…</option>
          </select>
          {jobId === "custom" && <textarea className={inputCls} rows={4} placeholder="Paste job description" value={custom} onChange={(e) => setCustom(e.target.value)} />}
          {err && <p className="text-sm text-danger">{err}</p>}
          <Btn className="w-full" onClick={run} disabled={busy}>{busy ? "Analyzing…" : "Analyze Resume"}</Btn>
        </Glass>

        <Glass className="lg:col-span-7">
          {!result ? (
            <div className="grid h-full min-h-80 place-items-center text-center text-muted-foreground">
              <div><div className="mx-auto mb-4 size-10 rounded-full border-2 border-border border-t-brand2 hs-spin" />Results will appear here after analysis.</div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-6">
                <ScoreRing value={result.match} label={matchCategory(result.match)} />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Job match score</div>
                  <div className="mt-1 text-2xl font-bold">{result.name}</div>
                  <div className="text-sm text-muted-foreground">{result.email} · {jobs.find((j) => j.id === result.jobId)?.title}</div>
                  <div className="mt-4 flex gap-3">
                    <Btn onClick={() => nav({ to: "/assessment/$id", params: { id: result.id } })}>Start Skill Verification</Btn>
                    <Link to="/candidates/$id" params={{ id: result.id }} className="rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-accent">Profile</Link>
                  </div>
                </div>
              </div>
              <Block title="Matched skills">{result.matched.map((s) => <SkillBadge key={s} s={s} tone="ok" />)}</Block>
              <Block title="Missing skills">{result.missing.length ? result.missing.map((s) => <SkillBadge key={s} s={s} tone="miss" />) : <span className="text-sm text-muted-foreground">None 🎉</span>}</Block>
              <Block title="Extracted skills">{result.skills.length ? result.skills.map((s) => <SkillBadge key={s} s={s} />) : <span className="text-sm text-muted-foreground">No known skills detected</span>}</Block>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {(["education", "experience", "projects", "certifications"] as const).map((k) => (
                  <div key={k} className="rounded-2xl border border-border bg-muted p-4">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
                    <ul className="mt-2 space-y-1 text-sm">{result[k].length ? result[k].map((l, i) => <li key={i}>• {l}</li>) : <li className="text-muted-foreground">Not found</li>}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Glass>
      </div>
    </section>
  );
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-6"><div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{title}</div><div className="flex flex-wrap gap-2">{children}</div></div>
);
