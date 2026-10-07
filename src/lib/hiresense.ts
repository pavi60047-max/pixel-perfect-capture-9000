import { useSyncExternalStore } from "react";

export type Job = {
  id: string; title: string; department: string; location: string; type: string;
  description: string; skills: string[]; experience: string;
};
export type Integrity = "Clear" | "Flagged" | "Pending";
export type Status = "Shortlisted" | "Under Review" | "Assessment Pending" | "Rejected";
export type Candidate = {
  id: string; name: string; email: string; jobId: string;
  skills: string[]; education: string[]; experience: string[]; projects: string[]; certifications: string[];
  matched: string[]; missing: string[]; match: number;
  quiz: number | null; integrity: Integrity; events: string[]; status: Status; resumeName: string;
};

export const SKILLS = [
  "Java","Python","SQL","JavaScript","TypeScript","HTML","CSS","React","Node.js","Express","MongoDB","PostgreSQL","MySQL",
  "Git","Docker","Kubernetes","AWS","Azure","Spring Boot","C++","C","Go","Django","Flask","REST API","GraphQL",
  "Machine Learning","TensorFlow","Pandas","Linux","Next.js","Tailwind","Redis","CI/CD","Figma","Data Structures",
];

export const matchCategory = (s: number) =>
  s >= 90 ? "Excellent Match" : s >= 75 ? "Strong Match" : s >= 60 ? "Moderate Match" : "Low Match";
export const recommendation = (s: number) =>
  s >= 90 ? "Excellent candidate – highly recommended." : s >= 75 ? "Strong candidate – recommended for interview."
  : s >= 60 ? "Moderate match – review skill gaps." : "Low match – additional evaluation recommended.";
export const finalScore = (c: Candidate) => c.quiz == null ? c.match : Math.round(c.match * 0.5 + c.quiz * 0.5);

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function extractSkills(text: string): string[] {
  return SKILLS.filter((s) => new RegExp(`(^|[^a-z0-9+#])${esc(s.toLowerCase())}([^a-z0-9+#]|$)`).test(text.toLowerCase()));
}
export function computeMatch(candidate: string[], required: string[]) {
  const lc = candidate.map((s) => s.toLowerCase());
  const matched = required.filter((r) => lc.includes(r.toLowerCase()));
  const missing = required.filter((r) => !lc.includes(r.toLowerCase()));
  return { matched, missing, match: required.length ? Math.round((matched.length / required.length) * 100) : 0 };
}
export function extractSections(text: string) {
  const lines = text.split(/\n|(?<=\.)\s+/).map((l) => l.trim()).filter((l) => l.length > 4);
  const pick = (re: RegExp, n = 4) => lines.filter((l) => re.test(l)).slice(0, n).map((l) => l.slice(0, 140));
  return {
    education: pick(/b\.?tech|b\.?e\b|bachelor|master|m\.?tech|university|college|degree|cgpa|gpa/i),
    experience: pick(/intern|engineer|developer|experience|worked|company|years?/i),
    projects: pick(/project|built|developed|implemented|created/i),
    certifications: pick(/certif|course|coursera|udemy|nptel/i, 3),
  };
}

// ---------- Questions ----------
export type Q = { skill: string; q: string; options: string[]; answer: number };
const BANK: Q[] = [
  { skill: "Java", q: "Which keyword prevents a Java class from being subclassed?", options: ["static", "final", "abstract", "private"], answer: 1 },
  { skill: "Java", q: "What is the default value of an int field in Java?", options: ["null", "undefined", "0", "-1"], answer: 2 },
  { skill: "Python", q: "What does `len([1, [2, 3], 4])` return?", options: ["4", "3", "2", "Error"], answer: 1 },
  { skill: "Python", q: "Which Python type is immutable?", options: ["list", "dict", "set", "tuple"], answer: 3 },
  { skill: "SQL", q: "Which clause filters rows after GROUP BY?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1 },
  { skill: "SQL", q: "Which JOIN returns only rows with matches in both tables?", options: ["LEFT JOIN", "FULL JOIN", "INNER JOIN", "CROSS JOIN"], answer: 2 },
  { skill: "JavaScript", q: "What is `typeof null` in JavaScript?", options: ["'null'", "'object'", "'undefined'", "'number'"], answer: 1 },
  { skill: "JavaScript", q: "Which method creates a new array with transformed elements?", options: ["forEach", "map", "reduce", "find"], answer: 1 },
  { skill: "HTML", q: "Which HTML element is most semantic for navigation links?", options: ["<div>", "<section>", "<nav>", "<menu>"], answer: 2 },
  { skill: "CSS", q: "Which CSS property makes a flex container wrap items?", options: ["flex-flow: column", "flex-wrap: wrap", "display: grid", "overflow: wrap"], answer: 1 },
  { skill: "MongoDB", q: "MongoDB stores data as…", options: ["Rows", "BSON documents", "Key files", "XML"], answer: 1 },
  { skill: "Git", q: "Which command creates a new branch and switches to it?", options: ["git branch -d x", "git checkout -b x", "git merge x", "git fetch x"], answer: 1 },
  { skill: "React", q: "Which hook runs side effects after render?", options: ["useMemo", "useRef", "useEffect", "useId"], answer: 2 },
  { skill: "Docker", q: "Which file defines how a Docker image is built?", options: ["docker.yml", "Dockerfile", "image.json", "compose.env"], answer: 1 },
  { skill: "Spring Boot", q: "Which annotation marks a Spring REST controller?", options: ["@Service", "@RestController", "@Entity", "@Bean"], answer: 1 },
  { skill: "Node.js", q: "Node.js executes JavaScript using which engine?", options: ["SpiderMonkey", "V8", "Chakra", "JVM"], answer: 1 },
  { skill: "TypeScript", q: "Which TS type accepts any value but requires narrowing before use?", options: ["any", "never", "unknown", "void"], answer: 2 },
  { skill: "Data Structures", q: "Average lookup time in a hash map is…", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], answer: 2 },
  { skill: "Data Structures", q: "Which structure follows LIFO order?", options: ["Queue", "Stack", "Heap", "Graph"], answer: 1 },
  { skill: "AWS", q: "Which AWS service provides object storage?", options: ["EC2", "S3", "RDS", "Lambda"], answer: 1 },
];
export function buildQuiz(skills: string[]): Q[] {
  const lc = skills.map((s) => s.toLowerCase());
  const pri = BANK.filter((q) => lc.includes(q.skill.toLowerCase()));
  const rest = BANK.filter((q) => !pri.includes(q));
  return [...pri, ...rest].slice(0, 10);
}

// ---------- Store ----------
type State = { jobs: Job[]; candidates: Candidate[] };
const KEY = "hiresense-v1";
const seedJobs: Job[] = [
  { id: "j1", title: "Software Developer", department: "Engineering", location: "Bengaluru", type: "Full-time", description: "Build backend services and web features.", skills: ["Java","Python","SQL","JavaScript","MongoDB","Git","Spring Boot","Docker"], experience: "0–2 years" },
  { id: "j2", title: "Frontend Engineer", department: "Product", location: "Remote", type: "Full-time", description: "Craft fast, accessible interfaces.", skills: ["JavaScript","TypeScript","React","HTML","CSS","Git"], experience: "1–3 years" },
  { id: "j3", title: "Data Analyst Intern", department: "Analytics", location: "Hyderabad", type: "Internship", description: "Analyze product data and build reports.", skills: ["Python","SQL","Pandas","Machine Learning"], experience: "Fresher" },
];
const mk = (id: string, name: string, jobId: string, skills: string[], quiz: number | null, integrity: Integrity, status: Status): Candidate => {
  const job = seedJobs.find((j) => j.id === jobId)!;
  return { id, name, email: `${name.split(" ")[0].toLowerCase()}@mail.com`, jobId, skills, education: ["B.Tech Computer Science"], experience: ["Software intern, 6 months"], projects: ["Full-stack project portfolio"], certifications: [], ...computeMatch(skills, job.skills), quiz, integrity, events: integrity === "Flagged" ? ["Left assessment tab", "Exited fullscreen"] : [], status, resumeName: `${name.split(" ")[0]}_Resume.pdf` };
};
const seed = (): State => ({
  jobs: seedJobs,
  candidates: [
    mk("c1", "Ananya Sharma", "j1", ["Java","Python","SQL","JavaScript","MongoDB","Git","Spring Boot","HTML"], 88, "Clear", "Shortlisted"),
    mk("c2", "Rahul Verma", "j1", ["Java","SQL","Git","HTML","CSS","Python"], 70, "Clear", "Under Review"),
    mk("c3", "Priya Nair", "j2", ["JavaScript","TypeScript","React","HTML","CSS","Git"], 90, "Clear", "Shortlisted"),
    mk("c4", "Karthik Reddy", "j2", ["JavaScript","HTML","CSS"], 60, "Flagged", "Under Review"),
    mk("c5", "Meera Iyer", "j3", ["Python","SQL","Pandas"], null, "Pending", "Assessment Pending"),
    mk("c6", "Arjun Mehta", "j1", ["Python","C++"], 40, "Flagged", "Rejected"),
  ],
});

let state: State | null = null;
const listeners = new Set<() => void>();
const SERVER = seed();
function get(): State {
  if (typeof window === "undefined") return SERVER;
  if (!state) {
    try { state = JSON.parse(localStorage.getItem(KEY) || "null") || seed(); } catch { state = seed(); }
  }
  return state!;
}
function set(fn: (s: State) => State) {
  state = fn(get());
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export function useStore() { return useSyncExternalStore(subscribe, get, () => SERVER); }

export const actions = {
  addCandidate: (c: Candidate) => set((s) => ({ ...s, candidates: [c, ...s.candidates] })),
  updateCandidate: (id: string, p: Partial<Candidate>) => set((s) => ({ ...s, candidates: s.candidates.map((c) => c.id === id ? { ...c, ...p } : c) })),
  saveJob: (j: Job) => set((s) => ({ ...s, jobs: s.jobs.some((x) => x.id === j.id) ? s.jobs.map((x) => x.id === j.id ? j : x) : [...s.jobs, j] })),
  deleteJob: (id: string) => set((s) => ({ ...s, jobs: s.jobs.filter((j) => j.id !== id) })),
};
export const uid = () => Math.random().toString(36).slice(2, 9);
