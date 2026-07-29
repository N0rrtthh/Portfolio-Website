"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Calendar, Flame, Activity, WifiOff } from "lucide-react";
import ChapterLabel from "@/components/ui/ChapterLabel";
import RevealText from "@/components/ui/RevealText";

const YEARS = [2022, 2023, 2024, 2025, 2026];
const GITHUB_USERNAME = "N0rrtthh";

interface DayData {
  date: string;
  count: number;
  level: number; // -1 = padding cell (not a real day, used to align the grid), 0-4 = real intensity
}

interface WeekData {
  contributionDays: DayData[];
}

interface CalendarResponse {
  username: string;
  year: number;
  totalContributions: number;
  weeks: WeekData[];
  source: "live" | "placeholder";
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Real contribution data, scraped from the public GitHub profile calendar.
// No auth required, no CORS issues from the browser. See:
// https://github.com/grubersjoe/github-contributions-api
const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

interface ApiContribution {
  date: string;
  count: number;
  level: number;
}

interface ApiResponse {
  total: Record<string, number>;
  contributions: ApiContribution[];
}

export default function GithubContributions() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRealGithubContributions() {
      setLoading(true);

      try {
        const res = await fetch(`${CONTRIBUTIONS_API}/${GITHUB_USERNAME}?y=${selectedYear}`);
        if (!res.ok) throw new Error(`API responded with ${res.status}`);

        const json: ApiResponse = await res.json();
        if (!json.contributions || json.contributions.length === 0) {
          throw new Error("No contribution data returned");
        }

        const total = json.total[String(selectedYear)] ?? 0;
        const weeks = buildWeeks(json.contributions, selectedYear);

        if (isMounted) {
          setData({
            username: GITHUB_USERNAME,
            year: selectedYear,
            totalContributions: total,
            weeks,
            source: "live",
          });
          setIsLive(true);
          setLoading(false);
        }
        return;
      } catch (err) {
        console.warn("Real GitHub contribution fetch failed, showing placeholder instead:", err);
      }

      if (isMounted) {
        setData(generatePlaceholderCalendar(selectedYear));
        setIsLive(false);
        setLoading(false);
      }
    }

    fetchRealGithubContributions();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  // Compute Statistics
  const realDays = (data?.weeks.flatMap((w) => w.contributionDays) || []).filter((d) => d.level !== -1);
  const totalCommits = data?.totalContributions || 0;
  const activeDays = realDays.filter((d) => d.count > 0).length;
  const maxDayCount = Math.max(0, ...realDays.map((d) => d.count));

  // Calculate longest streak
  let longestStreak = 0;
  let currentStreak = 0;
  realDays.forEach((d) => {
    if (d.count > 0) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  // Get color for contribution level
  const getCellColor = (level: number, count: number) => {
    if (level === -1) return "opacity-0 pointer-events-none border-transparent";
    if (count === 0 || level === 0) return "bg-white/[0.04] border-white/[0.05]";
    if (level === 1 || count < 4) return "bg-[#0e4429] border-[#006d32]/40 text-emerald-200";
    if (level === 2 || count < 8) return "bg-[#006d32] border-[#26a641]/50 text-emerald-100";
    if (level === 3 || count < 14) return "bg-[#26a641] border-[#39d353]/60 text-white";
    return "bg-[#39d353] border-[#39d353] text-black font-bold shadow-[0_0_12px_rgba(57,211,83,0.5)]";
  };

  return (
    <section id="github-activity" className="relative py-24 border-t border-[var(--color-glass-border)] bg-black/40 overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full" />

      <div className="container-narrow relative z-10">
        <ChapterLabel index={9} classic="GitHub Activity Archive" eva="CONTRIBUTION MATRIX" className="mb-4" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <RevealText as="h2" className="text-section-title font-display text-[var(--color-starlight)]">
              GitHub Commit History
            </RevealText>
            <p className="mt-2 text-sm text-[var(--color-pearl)]/70 max-w-xl">
              Real contribution activity fetched from{" "}
              <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold font-mono underline hover:text-white">
                @{GITHUB_USERNAME}
              </a>{" "}
              on GitHub.
            </p>
          </div>

          {/* Sync Status Indicator & Year Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[var(--color-pearl)]/60 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
                Loading…
              </div>
            ) : isLive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live from GitHub
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono">
                <WifiOff className="w-3.5 h-3.5" />
                Placeholder data (fetch failed)
              </div>
            )}

            {/* Year Cycle Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)]">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all duration-200 ${selectedYear === year
                      ? "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "text-[var(--color-pearl)]/60 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)]/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-[var(--color-pearl)]/60 mb-1 font-mono">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              Total Commits
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-starlight)]">
              {totalCommits.toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)]/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-[var(--color-pearl)]/60 mb-1 font-mono">
              <Flame className="w-4 h-4 text-amber-400" />
              Longest Streak
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-starlight)]">
              {longestStreak} Days
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)]/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-[var(--color-pearl)]/60 mb-1 font-mono">
              <Activity className="w-4 h-4 text-cyan-400" />
              Active Coding Days
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-starlight)]">
              {activeDays} Days
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)]/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-[var(--color-pearl)]/60 mb-1 font-mono">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Max Commits/Day
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-starlight)]">
              {maxDayCount}
            </div>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="relative p-6 rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)] backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedYear}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-emerald-500/20"
            >
              {/* Month Labels */}
              <div className="flex text-[10px] font-mono text-[var(--color-pearl)]/50 mb-2 pl-8 min-w-[760px] justify-between">
                {MONTH_LABELS.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>

              <div className="flex items-start gap-3 min-w-[760px]">
                {/* Day Labels */}
                <div className="flex flex-col justify-between text-[9px] font-mono text-[var(--color-pearl)]/40 h-[105px] pt-1">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Grid of Weeks */}
                <div className="grid grid-flow-col gap-1.5 flex-1">
                  {data?.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-1.5">
                      {week.contributionDays.map((day, dIdx) => (
                        <div
                          key={`${wIdx}-${dIdx}`}
                          onMouseEnter={() => day.level !== -1 && setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3 h-3 rounded-[3px] border transition-all duration-150 ${day.level === -1 ? "" : "cursor-pointer hover:scale-125 hover:z-20"
                            } ${getCellColor(day.level, day.count)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Legend & Tooltip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[var(--color-glass-border)] text-xs font-mono">
                {/* Active Tooltip Info */}
                <div className="text-[var(--color-pearl)]/80 min-h-[20px]">
                  {hoveredDay ? (
                    <span className="text-emerald-400 font-semibold">
                      {hoveredDay.count} contribution{hoveredDay.count === 1 ? "" : "s"} on{" "}
                      {new Date(hoveredDay.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="opacity-50">Hover over any cell for detailed commit data</span>
                  )}
                </div>

                {/* Intensity Legend */}
                <div className="flex items-center gap-2 text-[var(--color-pearl)]/50 text-[10px]">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-white/[0.04] border border-white/[0.05]" />
                    <div className="w-3 h-3 rounded-[2px] bg-[#0e4429]" />
                    <div className="w-3 h-3 rounded-[2px] bg-[#006d32]" />
                    <div className="w-3 h-3 rounded-[2px] bg-[#26a641]" />
                    <div className="w-3 h-3 rounded-[2px] bg-[#39d353]" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/**
 * Groups a flat list of days into GitHub-style weeks (Sunday first).
 * The first and last weeks are padded with invisible placeholder cells
 * (level: -1) so the grid lines up with real calendar weekdays.
 */
function buildWeeks(days: ApiContribution[], year: number): WeekData[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: WeekData[] = [];
  let currentWeek: DayData[] = [];

  const firstDate = new Date(`${year}-01-01T00:00:00`);
  const leadingPadding = firstDate.getDay(); // 0 (Sun) - 6 (Sat)
  for (let i = 0; i < leadingPadding; i++) {
    currentWeek.push({ date: "", count: -1, level: -1 });
  }

  sorted.forEach((day) => {
    currentWeek.push({ date: day.date, count: day.count, level: day.level });
    if (currentWeek.length === 7) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", count: -1, level: -1 });
    }
    weeks.push({ contributionDays: currentWeek });
  }

  return weeks;
}

/**
 * Used ONLY when the live GitHub fetch fails (network down, rate limit, etc).
 * This is randomly generated and intentionally never mixed with real numbers —
 * the "Placeholder data" badge in the UI makes that explicit to visitors.
 */
function generatePlaceholderCalendar(year: number): CalendarResponse {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const days: ApiContribution[] = [];

  let curr = new Date(startDate);
  while (curr <= endDate) {
    const dateStr = curr.toISOString().split("T")[0];
    const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
    const count = isWeekend ? (Math.random() < 0.3 ? Math.floor(Math.random() * 5) : 0) : Math.floor(Math.random() * 8);
    const level = count === 0 ? 0 : count < 4 ? 1 : count < 8 ? 2 : count < 14 ? 3 : 4;
    days.push({ date: dateStr, count, level });
    curr.setDate(curr.getDate() + 1);
  }

  const totalContributions = days.reduce((sum, d) => sum + d.count, 0);
  const weeks = buildWeeks(days, year);

  return {
    username: GITHUB_USERNAME,
    year,
    totalContributions,
    weeks,
    source: "placeholder",
  };
}