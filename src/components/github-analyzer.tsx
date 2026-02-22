import React, { useState, useMemo, useEffect } from "react";
import { 
  Github, 
  Trophy, 
  Flame, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  BarChart2,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { useGitHubAuth } from "@/hooks/use-github-auth";
import { GitHubSettings } from "./github-settings";
import { GitHubHeatmap } from "./github-heatmap";
import { ActivityDistributionChart } from "./activity-distribution-chart";
import { ActivityInsightCard } from "./activity-insight-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchGitHubContributions } from "@/lib/github-api";
import { fetchGitHubActivityDetails } from "@/lib/github-api-details";
import type { GitHubActivityDetails } from "@/lib/github-api-details";
import type { GitHubContributionCalendar } from "@/lib/github-api";
import { cn } from "@/lib/utils";
import { getDay, parseISO } from "date-fns";

const calculateGitHubStats = (calendar: GitHubContributionCalendar) => {
  const allDays = calendar.weeks.flatMap(w => w.contributionDays);
  const total = calendar.totalContributions;
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let bestDay = { date: "", count: 0 };
  const weekDays = [0, 0, 0, 0, 0, 0, 0];

  allDays.forEach(day => {
    const count = day.contributionCount;
    if (count > 0) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      if (count > bestDay.count) bestDay = { date: day.date, count };
    } else {
      tempStreak = 0;
    }
    const d = getDay(parseISO(day.date));
    weekDays[d] += count;
  });

  const reversedDays = [...allDays].reverse();
  for (const day of reversedDays) {
    if (day.contributionCount > 0) {
      currentStreak++;
    } else if (currentStreak > 0) {
      break;
    }
  }

  return { total, currentStreak, maxStreak, bestDay, weekDays };
};

export function GitHubAnalyzer() {
  const { username: storedUser, token: storedToken, isConfigured } = useGitHubAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GitHubContributionCalendar | null>(null);
  const [activityDetails, setActivityDetails] = useState<GitHubActivityDetails | null>(null);

  const stats = useMemo(() => data ? calculateGitHubStats(data) : null, [data]);

  const handleFetch = async () => {
    if (!storedUser || !storedToken) {
      setError("ユーザー名とトークンを設定してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [calendarResult, detailsResult] = await Promise.all([
        fetchGitHubContributions(storedUser, storedToken),
        fetchGitHubActivityDetails(storedUser, storedToken)
      ]);
      
      setData(calendarResult);
      setActivityDetails(detailsResult);
    } catch (err: any) {
      setError(err.message || "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfigured && !data && !loading) {
      handleFetch();
    }
  }, [isConfigured]);

  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

  if (!isConfigured && !data) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <Github className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">GitHub 連携が必要です</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              リアルタイムの活動データを表示するには、ユーザー名とアクセストークンの設定が必要です。
            </p>
          </div>
          <GitHubSettings />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Sync Status Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 p-5 rounded-2xl border border-border/40 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.15em] mb-0.5">Connected Account</p>
            <div className="flex items-center gap-2">
              <p className="text-base font-black text-foreground">{storedUser}</p>
              <GitHubSettings />
            </div>
          </div>
        </div>
        <Button 
          onClick={handleFetch} 
          disabled={loading} 
          variant="outline" 
          size="default"
          className="w-full sm:w-auto gap-2 border-border/60 hover:bg-muted/50 font-bold transition-all"
        >
          <RefreshCw className={cn("w-4 h-4 text-primary", loading && "animate-spin")} />
          最新のデータを同期
        </Button>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            <div className="space-y-6">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
            <Skeleton className="h-full min-h-[574px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[120px] w-full rounded-xl" />
        </div>
      )}

      {error && !loading && (
        <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-4 animate-in shake duration-500 shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div className="flex-1">
            <p className="font-black text-base">同期エラーが発生しました</p>
            <p className="text-xs font-medium opacity-90 mt-0.5">{error}</p>
          </div>
          <GitHubSettings />
        </div>
      )}

      {data && stats && !loading && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Main Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-black">Activity Density</p>
                  <Calendar className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-black">{stats.total.toLocaleString()}</div>
                <p className="text-[11px] text-muted-foreground mt-1 font-bold">Total Contributions</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/5 border-orange-500/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-black">Active Streak</p>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-3xl font-black">{stats.currentStreak} <span className="text-sm">Days</span></div>
                <p className="text-[11px] text-muted-foreground mt-1 font-bold">Current Consistency</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/5 border-yellow-500/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-black">Max Record</p>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-3xl font-black">{stats.maxStreak} <span className="text-sm">Days</span></div>
                <p className="text-[11px] text-muted-foreground mt-1 font-bold">Personal Best Streak</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-black">Peak Power</p>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-black">{stats.bestDay.count} <span className="text-sm">pts</span></div>
                <p className="text-[11px] text-muted-foreground mt-1 font-bold">{stats.bestDay.date}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-stretch">
            <div className="space-y-6">
              {/* Heatmap Card */}
              <Card className="overflow-hidden border-border/40 bg-card/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-black flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Contribution Graph
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GitHubHeatmap calendar={data} />
                </CardContent>
              </Card>

              {/* Day of Week Analysis Card */}
              <Card className="border-border/40 bg-card/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-black flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    曜日別分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5 py-2">
                    {stats.weekDays.map((count, i) => {
                      const max = Math.max(...stats.weekDays);
                      const percentage = max > 0 ? (count / max) * 100 : 0;
                      const totalPercentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0.0";
                      
                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-foreground">{dayLabels[i]}曜日</span>
                            <div className="flex gap-2.5 items-center">
                              <span className="text-muted-foreground font-medium">{count.toLocaleString()} <span className="text-[10px] uppercase">total</span></span>
                              <span className="text-primary font-black text-sm">{totalPercentage}%</span>
                            </div>
                          </div>
                          <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--primary),0.4)]" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Distribution Card */}
            {activityDetails && (
              <ActivityDistributionChart details={activityDetails} className="h-full" />
            )}
          </div>

          {/* Bottom Full Width Insights */}
          {activityDetails && (
            <div className="animate-in slide-in-from-bottom-2 duration-1000 delay-300">
              <ActivityInsightCard details={activityDetails} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
