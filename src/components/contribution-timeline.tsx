import React, { useState, useEffect } from "react";
import { 
  History, 
  ChevronDown, 
  Clock, 
  AlertCircle,
  RefreshCcw,
  Award
} from "lucide-react";
import { useGitHubAuth } from "@/hooks/use-github-auth";
import { fetchUserCreationYear, fetchYearlyContributions } from "@/lib/github-api-multi";
import type { YearlyData } from "@/lib/github-api-multi";
import { GitHubHeatmap } from "./github-heatmap";
import { YearSummaryCard } from "./year-summary-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ContributionTimeline() {
  const { username, token, isConfigured } = useGitHubAuth();
  const [yearsData, setYearsData] = useState<YearlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationYear, setCreationYear] = useState<number | null>(null);
  const [loadedYears, setLoadedYears] = useState<number[]>([]);

  const initTimeline = async () => {
    if (!isConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const startYear = await fetchUserCreationYear(username, token);
      setCreationYear(startYear);
      const currentYear = new Date().getFullYear();
      const data = await fetchYearlyContributions(username, token, currentYear);
      setYearsData([data]);
      setLoadedYears([currentYear]);
    } catch (err: any) {
      setError(err.message || "履歴の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfigured && !creationYear) {
      initTimeline();
    }
  }, [isConfigured]);

  const loadNextYear = async () => {
    if (!creationYear || loading) return;
    const minLoaded = Math.min(...loadedYears);
    if (minLoaded <= creationYear) return;
    const nextYear = minLoaded - 1;
    setLoading(true);
    try {
      const data = await fetchYearlyContributions(username, token, nextYear);
      setYearsData(prev => [...prev, data].sort((a, b) => b.year - a.year));
      setLoadedYears(prev => [...prev, nextYear]);
    } catch (err: any) {
      console.error(`Failed to load year ${nextYear}:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) return null;

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            努力のタイムライン
          </h2>
          <p className="text-muted-foreground text-sm">
            GitHub アカウント作成時からのすべての記録を辿ります。
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={initTimeline} disabled={loading} className="gap-2">
          <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          再読込
        </Button>
      </div>

      <div className="max-h-[750px] overflow-y-auto w-full pr-4 rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm p-4">
        <div className="relative space-y-12 pb-20">
          <div className="absolute left-[17px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-primary/30 via-border/20 to-transparent" />

          {yearsData.map((yearData) => {
            const allDays = yearData.calendar.weeks.flatMap(w => w.contributionDays);
            const activeDays = allDays.filter(d => d.contributionCount > 0).length;
            const maxDay = Math.max(...allDays.map(d => d.contributionCount), 0);

            return (
              <div key={yearData.year} className="relative pl-12 space-y-4">
                <div className="absolute left-0 top-1 w-9 h-9 bg-background border-2 border-primary rounded-full flex items-center justify-center shadow-lg z-10">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter text-primary/80 border-b border-border/40 pb-2">
                  {yearData.year}
                </h3>
                <div className="space-y-6">
                  <YearSummaryCard 
                    year={yearData.year}
                    total={yearData.calendar.totalContributions}
                    activeDays={activeDays}
                    maxDay={maxDay}
                  />
                  <GitHubHeatmap calendar={yearData.calendar} />
                </div>
              </div>
            );
          })}

          <div className="pl-12 flex flex-col items-center">
            {loading ? (
              <div className="text-sm text-muted-foreground animate-pulse">読み込み中...</div>
            ) : creationYear && Math.min(...loadedYears) > creationYear ? (
              <Button 
                variant="ghost" 
                onClick={loadNextYear} 
                className="group gap-2 text-muted-foreground hover:text-primary mt-4"
              >
                さらに過去を読み込む
                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </Button>
            ) : creationYear ? (
              <div className="text-center py-8 opacity-40">
                <p className="text-sm font-bold flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  あなたの旅はここから始まりました ({creationYear}年)
                </p>
              </div>
            ) : null}
          </div>

          {error && (
            <div className="ml-12 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
