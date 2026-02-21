import React, { useState, useMemo, useEffect } from "react";
import { 
  Github, 
  Search, 
  Trophy, 
  Flame, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  BarChart2,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { format, parseISO, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import { useGitHubAuth } from "@/hooks/use-github-auth";
import { GitHubSettings } from "./github-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchGitHubContributions } from "@/lib/github-api";
import type { GitHubContributionCalendar, GitHubContributionDay } from "@/lib/github-api";
import { cn } from "@/lib/utils";

// Stats Calculation for GitHub Data
const calculateGitHubStats = (calendar: GitHubContributionCalendar) => {
  const allDays = calendar.weeks.flatMap(w => w.contributionDays);
  const total = calendar.totalContributions;
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let bestDay = { date: "", count: 0 };
  
  // Weekly distribution
  const weekDays = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat

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

  // Simplified Current Streak (last consecutive days with activity)
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

  const stats = useMemo(() => data ? calculateGitHubStats(data) : null, [data]);

  const handleFetch = async () => {
    if (!storedUser || !storedToken) {
      setError("ユーザー名とトークンを設定してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchGitHubContributions(storedUser, storedToken);
      setData(result);
    } catch (err: any) {
      setError(err.message || "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if configured on mount or when auth changes
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
    <TooltipProvider delayDuration={0}>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Simplified Header with Sync Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 p-4 rounded-xl border border-border/40 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Connected as</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">{storedUser}</p>
                <GitHubSettings />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleFetch} 
            disabled={loading} 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto gap-2 border-border/50 hover:bg-muted/50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            最新のデータを取得
          </Button>
        </div>

        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        )}

        {error && !loading && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3 animate-in shake duration-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">データの同期に失敗しました</p>
              <p className="text-xs opacity-80 mt-0.5">{error}</p>
            </div>
            <GitHubSettings />
          </div>
        )}

        {data && stats && !loading && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Activity Density</p>
                    <Calendar className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">{stats.total}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Total Contributions</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-500/5 border-orange-500/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Streak</p>
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">{stats.currentStreak} Days</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Current Continuous Activity</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/5 border-yellow-500/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Max Record</p>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">{stats.maxStreak} Days</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Personal Best Streak</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Peak Power</p>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">{stats.bestDay.count} pts</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{stats.bestDay.date}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
              {/* Actual Heatmap */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-md flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub Contribution Graph
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto pb-4">
                    <div className="flex gap-[3px] min-w-max p-2">
                      {data.weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                          {week.contributionDays.map((day) => (
                            <Tooltip key={day.date}>
                              <TooltipTrigger asChild>
                                <div 
                                  className="w-[11px] h-[11px] rounded-[2px] transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1"
                                  style={{ backgroundColor: day.contributionCount > 0 ? day.color : 'rgba(128, 128, 128, 0.1)' }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <p className="font-bold">{day.contributionCount} contributions</p>
                                  <p className="text-[10px] opacity-70">{format(parseISO(day.date), "yyyy/MM/dd")}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-2 text-[10px] text-muted-foreground mt-2">
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                      <div className="w-[11px] h-[11px] rounded-[2px] bg-muted/50" />
                      <div className="w-[11px] h-[11px] rounded-[2px] bg-[#9be9a8]" />
                      <div className="w-[11px] h-[11px] rounded-[2px] bg-[#40c463]" />
                      <div className="w-[11px] h-[11px] rounded-[2px] bg-[#30a14e]" />
                      <div className="w-[11px] h-[11px] rounded-[2px] bg-[#216e39]" />
                    </div>
                    <span>More</span>
                  </div>
                </CardContent>
              </Card>

              {/* Day of Week Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-md flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    曜日別分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.weekDays.map((count, i) => {
                      const max = Math.max(...stats.weekDays);
                      const percentage = max > 0 ? (count / max) * 100 : 0;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-medium">
                            <span>{dayLabels[i]}曜日</span>
                            <span className="text-muted-foreground">{count} total</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-1000" 
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
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
