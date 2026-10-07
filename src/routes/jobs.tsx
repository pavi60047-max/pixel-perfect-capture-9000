import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Glass, SkillBadge, inputCls } from "@/components/hs";
import { actions, finalScore, uid, useStore, type Job } from "@/lib/hiresense";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Job Management – HireSense AI" },
      { name: "description", content: "Create and manage job descriptions and required skills." },
      { property: "og:title", content: "Job Management – HireSense AI" },
      { property: "og:description", content: "Manage roles, applicants and match scores." },
    ],
  }),
  component: Jobs,
});

const empty = { id: "", title: "", department: "", location: "", type: "Full-time", description: "", skills: [] as string[], experience: "" };

function Jobs() {
  const { jobs, candidates } = useStore();
  const [f, setF] = useState<Job>(empty);
  const [skills, setSkills] = useState("");
  const set = (k: keyof Job) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  function save() {
    if (!f.title) return;
    actions.saveJob({ ...f, id: f.id || uid(), skills: skills.split(",").map((s) => s.trim()).filter(Boolean) });
    setF(empty); setSkills("");
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-6 md:px-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Job Management</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <Glass className="space-y-3 lg:col-span-4">
          <h2 className="font-bold">{f.id ? "Edit job" : "Create a new job"}</h2>
          <input className={inputCls} placeholder="Job title" value={f.title} onChange={set("title")} />
          <input className={inputCls} placeholder="Department" value={f.department} onChange={set("department")} />
          <input className={inputCls} placeholder="Location" value={f.location} onChange={set("location")} />
          <select className={inputCls} value={f.type} onChange={set("type")}>{["Full-time", "Part-time", "Internship", "Contract"].map((t) => <option key={t}>{t}</option>)}</select>
          <input className={inputCls} placeholder="Experience required" value={f.experience} onChange={set("experience")} />
          <textarea className={inputCls} rows={3} placeholder="Job description" value={f.description} onChange={set("description")} />
          <input className={inputCls} placeholder="Required skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
          <div className="flex gap-2"><Btn className="flex-1" onClick={save}>{f.id ? "Save Job" : "Create Job"}</Btn>{f.id && <Btn variant="ghost" onClick={() => { setF(empty); setSkills(""); }}>Cancel</Btn>}</div>
        </Glass>
        <div className="grid gap-4 md:grid-cols-2 lg:col-span-8">
          {jobs.map((j) => {
            const apps = candidates.filter((c) => c.jobId === j.id);
            const avg = apps.length ? Math.round(apps.reduce((a, c) => a + finalScore(c), 0) / apps.length) : 0;
            return (
              <Glass key={j.id} className="p-6">
                <div className="text-xs text-brand2">{j.department} · {j.location} · {j.type}</div>
                <h3 className="mt-1 text-xl font-bold">{j.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{j.experience}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Applicants", apps.length], ["Avg score", `${avg}%`], ["Shortlisted", apps.filter((c) => c.status === "Shortlisted").length]].map(([a, b]) => (
                    <div key={a} className="rounded-xl bg-muted p-2"><div className="font-bold">{b}</div><div className="text-[10px] text-muted-foreground">{a}</div></div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">{j.skills.map((s) => <SkillBadge key={s} s={s} />)}</div>
                <div className="mt-5 flex gap-3 text-xs font-semibold">
                  <button className="text-brand2" onClick={() => { setF(j); setSkills(j.skills.join(", ")); }}>Edit</button>
                  <button className="text-danger" onClick={() => actions.deleteJob(j.id)}>Delete</button>
                  <Link to="/dashboard" className="ml-auto text-secondary-foreground">View Candidates →</Link>
                </div>
              </Glass>
            );
          })}
        </div>
      </div>
    </section>
  );
}
