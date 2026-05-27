"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Brain, Code, Sliders, Layers, Plus, X, Loader2, ChevronRight, BookOpen } from "lucide-react";

interface InterviewFormProps {
  userId: string;
  userName: string;
}

const LEVELS = ["Junior", "Mid-level", "Senior", "Lead"];
const TYPES = ["Technical", "Behavioural", "Mixed"];
const SUGGESTED_TECHS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js",
  "Python", "Java", "Go", "AWS", "Docker", "MongoDB", "PostgreSQL", "Firebase",
];

const InterviewForm = ({ userId, userName }: InterviewFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [form, setForm] = useState({
    role: "",
    type: "Mixed",
    level: "Mid-level",
    techstack: [] as string[],
    amount: 5,
  });

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !form.techstack.includes(trimmed)) {
      setForm((p) => ({ ...p, techstack: [...p.techstack, trimmed] }));
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    setForm((p) => ({ ...p, techstack: p.techstack.filter((t) => t !== tech) }));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      addTech(techInput);
    }
    if (e.key === "Backspace" && techInput === "" && form.techstack.length > 0) {
      removeTech(form.techstack[form.techstack.length - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.role.trim()) {
      toast.error("Please enter a job role.");
      return;
    }
    if (form.techstack.length === 0) {
      toast.error("Please select at least one technology.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          type: form.type,
          level: form.level,
          techstack: form.techstack.join(","),
          amount: form.amount,
          userid: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate interview.");
      }

      toast.success("Interview created! Redirecting...");
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mt-6">
      {/* Glow highlight behind card */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-primary-200/10 to-violet-500/10 opacity-30 blur-2xl pointer-events-none" />

      <div className="relative rounded-2xl border border-white/5 bg-[#0D0E12]/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_50px_-12px_rgba(167,139,250,0.15)] flex flex-col gap-6">
        
        {/* Form Title Section */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary-200/10 border border-primary-200/20 text-primary-200">
            <Sparkles className="size-5 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Generate Interview</h2>
            <p className="text-xs text-light-400">
              Hi {userName}! Fill in the details below and we&apos;ll create a
              personalised interview for you.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Job Role */}
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="text-xs font-bold text-light-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Brain className="size-3.5 text-primary-200" />
              <span>Job Role</span>
            </label>
            <input
              id="role"
              type="text"
              placeholder="e.g. Frontend Developer"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full bg-[#16171D]/60 border border-white/5 rounded-xl min-h-11 px-4 text-xs text-white placeholder:text-light-400/30 focus:border-primary-200 focus:ring-1 focus:ring-primary-200/30 outline-none transition-all duration-300"
              disabled={isLoading}
            />
          </div>

          {/* Level Toggle List */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-light-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="size-3.5 text-primary-200" />
              <span>Experience Level</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, level: lvl }))}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                    form.level === lvl
                      ? "bg-primary-200 text-dark-100 border-primary-200 shadow-[0_2px_10px_-2px_rgba(167,139,250,0.4)] scale-102"
                      : "border-white/5 bg-[#16171D]/30 text-light-100 hover:border-primary-200/40 hover:bg-[#16171D]"
                  }`}
                  disabled={isLoading}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Type Toggle List */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-light-100 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="size-3.5 text-primary-200" />
              <span>Interview Type</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                    form.type === t
                      ? "bg-primary-200 text-dark-100 border-primary-200 shadow-[0_2px_10px_-2px_rgba(167,139,250,0.4)] scale-102"
                      : "border-white/5 bg-[#16171D]/30 text-light-100 hover:border-primary-200/40 hover:bg-[#16171D]"
                  }`}
                  disabled={isLoading}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tech Stack Custom Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-light-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Code className="size-3.5 text-primary-200" />
              <span>Tech Stack</span>
            </label>

            {/* Tag Selection container */}
            <div
              className="flex flex-wrap gap-2 p-2 bg-[#16171D]/60 border border-white/5 rounded-xl min-h-[44px] focus-within:border-primary-200/40 transition-all duration-300"
            >
              {form.techstack.map((tech) => (
                <span
                  key={tech}
                  className="flex items-center gap-1 bg-primary-200/10 border border-primary-200/20 text-primary-200 px-2.5 py-0.5 rounded-md text-xs font-bold"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="ml-1 hover:text-white transition-colors cursor-pointer"
                    disabled={isLoading}
                    aria-label={`Remove ${tech}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                onBlur={() => addTech(techInput)}
                placeholder={form.techstack.length === 0 ? "Type a technology and press Enter..." : "Add tech..."}
                className="flex-1 min-w-[130px] bg-transparent text-xs outline-none text-white placeholder:text-light-400/30"
                disabled={isLoading}
              />
            </div>

            {/* Tech suggestions pills */}
            <div className="flex flex-wrap gap-1 mt-1">
              {SUGGESTED_TECHS.filter((t) => !form.techstack.includes(t)).map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => addTech(tech)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-white/5 bg-[#16171D]/20 text-light-100 hover:border-primary-200/30 hover:bg-[#16171D] transition-all duration-300 cursor-pointer"
                  disabled={isLoading}
                >
                  <Plus className="size-2.5 text-primary-200" />
                  <span>{tech}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount of questions slider */}
          <div className="flex flex-col gap-2.5 mt-1">
            <div className="flex justify-between items-center text-xs font-bold text-light-100 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders className="size-3.5 text-primary-200" />
                <span>Number of Questions</span>
              </span>
              <span className="text-[10px] bg-primary-200/10 border border-primary-200/20 px-2 py-0.5 rounded text-primary-200 font-bold">
                {form.amount} Questions
              </span>
            </div>
            <div className="relative flex flex-col gap-1">
              <input
                id="amount"
                type="range"
                min={3}
                max={15}
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: Number(e.target.value) }))
                }
                className="w-full h-1 bg-[#16171D] border border-white/5 rounded-lg appearance-none accent-primary-200 cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex justify-between text-[10px] text-light-400/40 font-bold px-0.5">
                <span>3</span>
                <span>15</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full mt-3 bg-primary-200 text-dark-100 hover:bg-white transition-all duration-300 rounded-xl min-h-11 font-bold px-5 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_25px_-5px_rgba(167,139,250,0.4)] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Generating Interview...</span>
              </>
            ) : (
              <>
                <span>Generate Interview</span>
                <ChevronRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm;
