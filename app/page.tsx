"use client";

import React, { useState } from "react";

interface Scores {
  overall: number;
  skills: number;
  experience: number;
  responsibilities: number;
  education: number;
  seniority: number;
  soft_skills: number;
  ats: number;
}

interface RequirementMatch {
  requirement: string;
  type: string;
  category: string;
  status: "MATCHED" | "PARTIAL" | "MISSING" | string;
  confidence: number;
  evidence?: string;
  details?: string;
}

interface ATSAnalysis {
  score: number;
  contact_info_present: boolean;
  section_structure_score: number;
  keyword_coverage_score: number;
  formatting_issues: string[];
  recommendations: string[];
  disclaimer: string;
}

interface BulletImprovement {
  original: string;
  improved: string;
  reason: string;
  metrics_added: boolean;
}

interface AnalysisResponse {
  scores: Scores;
  verdict: string;
  matched_requirements: RequirementMatch[];
  partial_requirements: RequirementMatch[];
  missing_requirements: RequirementMatch[];
  recommendations: string[];
  bullet_improvements: BulletImprovement[];
  interview_questions: string[];
  evidence_quality: Record<string, any>;
  ats_analysis?: ATSAnalysis;
}

const SAMPLE_RESUME = `Alex Chen
San Francisco, CA | alex.chen@email.com | github.com/alexchen | linkedin.com/in/alexchen

SUMMARY
Senior Full Stack & AI Software Engineer with 6+ years of experience building scalable web applications, microservices, and AI integrations. Expertise in React, Next.js, Node.js, Python, PostgreSQL, and AWS.

EXPERIENCE
Senior Software Engineer | TechSphere Inc. | 2022 - Present
- Led a team of 5 engineers to architect and deploy a real-time data analytics dashboard serving 250,000 active users using React, TypeScript, and FastAPI.
- Implemented automated CI/CD pipelines on AWS ECS and GitHub Actions, reducing deployment cycle times by 40%.
- Integrated OpenAI and Google Gemini APIs into core enterprise search workflow, improving query resolution accuracy by 35%.

Full Stack Developer | CloudScale Solutions | 2019 - 2022
- Developed responsive web applications using React, Redux, Node.js, and Express with PostgreSQL database backends.
- Optimized database SQL queries and Redis caching layer, cutting API response times from 450ms to 90ms.
- Collaborated with product designers to implement modern accessibility-compliant (WCAG AA) component libraries.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2015 - 2019

SKILLS
Programming: JavaScript, TypeScript, Python, SQL, HTML/CSS
Frameworks: React, Next.js, Node.js, Express, FastAPI, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS (S3, ECS, Lambda), Docker, Git`;

const SAMPLE_JD = `Senior Full-Stack Engineer (React & Python)

Company: InnovateAI Solutions
Location: Remote / San Francisco, CA

About the Role:
We are looking for a Senior Full-Stack Engineer to build next-generation AI-powered tools. You will lead development across our frontend React/Next.js UI and backend Python (FastAPI/Django) microservices.

Requirements (Must Have):
- 5+ years of software development experience with full-stack web applications.
- Strong proficiency in React, TypeScript, and modern state management.
- Demonstrated hands-on experience building RESTful APIs using Python (FastAPI or Flask/Django).
- Solid knowledge of relational databases (PostgreSQL/Postgres) and SQL query optimization.
- Experience integrating Cloud LLM APIs (Google Gemini, OpenAI) into production applications.

Nice to Have (Preferred):
- Experience with Cloud Infrastructure (AWS, ECS, Serverless).
- Knowledge of vector databases, RAG architectures, and AI Agent frameworks.
- Familiarity with Docker and Kubernetes container deployment.

Responsibilities:
- Architect and develop scalable web applications end-to-end.
- Collaborate with product managers and AI researchers to ship user-facing features.
- Write clean, unit-tested code and participate in peer code reviews.`;

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "ats" | "rewrite">("overview");

  // Rewrite Tool State
  const [rewriteInput, setRewriteInput] = useState("");
  const [rewriteMode, setRewriteMode] = useState<"conservative" | "strong" | "achievement_focused">("strong");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<any | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      setLoadingStep("Extracting text from uploaded document...");
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to extract text from file.");
      }

      const data = await res.json();
      setResumeText(data.resume_text);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const loadSamples = () => {
    setResumeText(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JD);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!resumeText.trim()) {
      setError("Please enter or upload your resume text.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter the target job description.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const steps = [
      "⚡ Resume Agent extracting candidate profile...",
      "🎯 Job Agent analyzing MUST HAVE vs NICE TO HAVE requirements...",
      "🔍 ATS Agent inspecting formatting & keyword density...",
      "⚖️ Matcher Agent comparing skills & recognized synonyms...",
      "🛡️ Reviewer Agent auditing extractions & metrics...",
      "📊 Scoring Engine computing deterministic weighted match scores...",
      "✨ Finalizing comprehensive analysis..."
    ];

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 1200);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Analysis request failed.");
      }

      const data: AnalysisResponse = await res.json();
      setAnalysis(data);
      setActiveTab("overview");
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const runRewrite = async () => {
    if (!rewriteInput.trim()) return;
    setIsRewriting(true);
    setRewriteResult(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: rewriteInput,
          job_description: jobDescription,
          mode: rewriteMode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Rewrite failed.");
      }

      const data = await res.json();
      setRewriteResult(data);
    } catch (err: any) {
      alert(`Rewrite error: ${err.message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            IQ
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ResumeIQ
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                FastAPI Python Agent Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">AI-Powered Resume Analysis & Job Matcher</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSamples}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Load Sample Resume & JD
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 font-bold hover:text-red-200">
              ✕
            </button>
          </div>
        )}

        {/* Input Controls Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Input Box */}
          <div className="flex flex-col gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                📄 Resume Content
              </label>
              <label className="cursor-pointer text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-indigo-400 hover:bg-slate-700 transition">
                Upload PDF / DOCX / TXT
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your candidate resume text here, or click upload above..."
              className="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition resize-none"
            />
          </div>

          {/* Job Description Input Box */}
          <div className="flex flex-col gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <label className="text-sm font-semibold text-slate-200">
              🎯 Target Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              className="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition resize-none"
            />
          </div>
        </div>

        {/* Analyze Action Bar */}
        <div className="flex items-center justify-center">
          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className={`px-8 py-3.5 rounded-xl font-semibold text-white shadow-xl transition-all transform active:scale-95 flex items-center gap-3 text-base ${
              isLoading
                ? "bg-slate-800 cursor-not-allowed opacity-75"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-indigo-500/25"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>🚀 Run AI Agent Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-center flex flex-col items-center gap-3 animate-pulse">
            <div className="text-lg font-medium text-indigo-300">{loadingStep}</div>
            <p className="text-xs text-indigo-400/70">
              Running multi-agent pipeline: Resume Agent, Job Agent & ATS Agent executing concurrently.
            </p>
          </div>
        )}

        {/* Results Section */}
        {analysis && !isLoading && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Overall Score Circle */}
              <div className="flex items-center gap-6">
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-indigo-500/30 bg-slate-950 shadow-inner">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-white">{analysis.scores.overall}</span>
                    <span className="text-xs text-slate-400 block">/ 100</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Match Verdict</div>
                  <div className="text-2xl font-bold text-indigo-300">{analysis.verdict}</div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Deterministic score computed via 7-factor weighted algorithm. Gemini explains the results.
                  </p>
                </div>
              </div>

              {/* Subscores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                <ScoreCard label="Skills (30%)" val={analysis.scores.skills} />
                <ScoreCard label="Experience (20%)" val={analysis.scores.experience} />
                <ScoreCard label="Responsibilities (15%)" val={analysis.scores.responsibilities} />
                <ScoreCard label="Tech Stack (15%)" val={analysis.scores.skills} />
                <ScoreCard label="Education (10%)" val={analysis.scores.education} />
                <ScoreCard label="Seniority (5%)" val={analysis.scores.seniority} />
                <ScoreCard label="Soft Skills (5%)" val={analysis.scores.soft_skills} />
                <ScoreCard label="ATS Score" val={analysis.scores.ats} highlight />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-4">
              <TabBtn
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                label="Summary & Recommendations"
              />
              <TabBtn
                active={activeTab === "matches"}
                onClick={() => setActiveTab("matches")}
                label={`Requirements Match (${analysis.matched_requirements.length} Matched, ${analysis.missing_requirements.length} Missing)`}
              />
              <TabBtn
                active={activeTab === "ats"}
                onClick={() => setActiveTab("ats")}
                label={`ATS Evaluation (${analysis.scores.ats}/100)`}
              />
              <TabBtn
                active={activeTab === "rewrite"}
                onClick={() => setActiveTab("rewrite")}
                label="AI Bullet Rewriter"
              />
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Actionable Recommendations */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    💡 Actionable Recommendations
                  </h3>
                  <ul className="flex flex-col gap-2.5 text-sm text-slate-300">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interview Questions */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🎤 Anticipated Interview Questions
                  </h3>
                  <ul className="flex flex-col gap-2.5 text-sm text-slate-300">
                    {analysis.interview_questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <span className="text-purple-400 font-bold">Q{i + 1}:</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Requirements Match */}
            {activeTab === "matches" && (
              <div className="flex flex-col gap-4">
                {/* Matched Requirements */}
                {analysis.matched_requirements.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                      ✅ Matched Requirements ({analysis.matched_requirements.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {analysis.matched_requirements.map((m, idx) => (
                        <MatchCard key={idx} match={m} color="emerald" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Partial Requirements */}
                {analysis.partial_requirements.length > 0 && (
                  <div className="flex flex-col gap-3 mt-4">
                    <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                      ⚠️ Partial Matches ({analysis.partial_requirements.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {analysis.partial_requirements.map((m, idx) => (
                        <MatchCard key={idx} match={m} color="amber" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Requirements */}
                {analysis.missing_requirements.length > 0 && (
                  <div className="flex flex-col gap-3 mt-4">
                    <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                      ❌ Missing Requirements ({analysis.missing_requirements.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {analysis.missing_requirements.map((m, idx) => (
                        <MatchCard key={idx} match={m} color="red" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: ATS Evaluation */}
            {activeTab === "ats" && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">ATS Parsing & Format Check</h3>
                    <p className="text-xs text-slate-400">{analysis.ats_analysis?.disclaimer}</p>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {analysis.ats_analysis?.score || 85} / 100
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Contact Information</div>
                    <div className="text-sm font-semibold text-emerald-400 mt-1">
                      {analysis.ats_analysis?.contact_info_present ? "✓ Detected" : "⚠️ Missing details"}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Section Structure</div>
                    <div className="text-sm font-semibold text-indigo-300 mt-1">
                      {analysis.ats_analysis?.section_structure_score || 90}% Optimal
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Keyword Coverage</div>
                    <div className="text-sm font-semibold text-purple-300 mt-1">
                      {analysis.ats_analysis?.keyword_coverage_score || 80}% Aligned
                    </div>
                  </div>
                </div>

                {analysis.ats_analysis?.recommendations && analysis.ats_analysis.recommendations.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase">ATS Formatting Tips:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-400 flex flex-col gap-1">
                      {analysis.ats_analysis.recommendations.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: AI Bullet Rewriter */}
            {activeTab === "rewrite" && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white">AI Resume Bullet Rewriter</h3>
                  <p className="text-xs text-slate-400">
                    Improve impact without fabricating facts or metrics.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <textarea
                    value={rewriteInput}
                    onChange={(e) => setRewriteInput(e.target.value)}
                    placeholder="Paste a resume bullet point or accomplishment here..."
                    className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition resize-none"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Mode:</span>
                      {(["conservative", "strong", "achievement_focused"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setRewriteMode(m)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition ${
                            rewriteMode === m
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                          }`}
                        >
                          {m.replace("_", " ")}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={runRewrite}
                      disabled={isRewriting || !rewriteInput.trim()}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg"
                    >
                      {isRewriting ? "Rewriting..." : "✨ Rewrite Bullet"}
                    </button>
                  </div>

                  {rewriteResult && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col gap-2">
                      <div className="text-xs text-indigo-400 font-semibold uppercase">Improved Wording:</div>
                      <div className="text-sm text-slate-100 font-medium bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {rewriteResult.improved_text}
                      </div>
                      {rewriteResult.changes_made && (
                        <div className="text-xs text-slate-400 mt-1">
                          Changes: {rewriteResult.changes_made.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ScoreCard({ label, val, highlight = false }: { label: string; val: number; highlight?: boolean }) {
  return (
    <div
      className={`p-3 rounded-xl border flex flex-col justify-between ${
        highlight
          ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-200"
          : "bg-slate-950/60 border-slate-800 text-slate-300"
      }`}
    >
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <span className="text-lg font-bold text-white mt-1">{val}%</span>
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-2 text-sm font-semibold transition border-b-2 ${
        active
          ? "border-indigo-500 text-indigo-400"
          : "border-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function MatchCard({ match, color }: { match: RequirementMatch; color: "emerald" | "amber" | "red" }) {
  const borderColors = {
    emerald: "border-emerald-500/30 bg-emerald-950/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-950/10 text-amber-300",
    red: "border-red-500/30 bg-red-950/10 text-red-300",
  };

  return (
    <div className={`p-3.5 rounded-xl border ${borderColors[color]} flex flex-col gap-1.5`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-100">{match.requirement}</span>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          {match.category}
        </span>
      </div>
      {match.evidence && (
        <p className="text-xs text-slate-400 italic">"{match.evidence}"</p>
      )}
      {match.details && <p className="text-xs text-slate-400">{match.details}</p>}
    </div>
  );
}
