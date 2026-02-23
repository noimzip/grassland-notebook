import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  format, 
  parseISO, 
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  startOfToday
} from "date-fns";
import { ja } from "date-fns/locale";
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Activity,
  Flame,
  Target,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectWithActivities, ProjectActivityLog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectAnalysisDashboardProps {
  projects: ProjectWithActivities[];
}

const COLORS = ["#10b981", "#3b82f6", "#6366f1", "#f97316", "#f43f5e", "#fbbf24"];

export function ProjectAnalysisDashboard({ projects }: ProjectAnalysisDashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "all");
  const [timeRange, setTimeRange] = useState<string>("30");

  const selectedProject = useMemo(() => {
    if (selectedProjectId === "all") return null;
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const allActivities = useMemo(() => {
    if (selectedProject) return selectedProject.activities;
    return projects.flatMap(p => p.activities);
  }, [projects, selectedProject]);

  const stats = useMemo(() => {
    const today = startOfToday();
    const activities = allActivities;
    
    const totalValue = activities.reduce((sum, a) => sum + Number(a.value), 0);
    const avgValue = activities.length > 0 ? totalValue / activities.length : 0;
    
    // Best Day
    let bestDay: ProjectActivityLog | null = null;
    activities.forEach(a => {
      if (!bestDay || Number(a.value) > Number(bestDay.value)) {
        bestDay = a;
      }
    });

    // Current Streak (for selected project or overall)
    let currentStreak = 0;
    const activityMap = new Map<string, number>();
    activities.forEach(a => {
      const existing = activityMap.get(a.date) || 0;
      activityMap.set(a.date, existing + Number(a.value));
    });

    let checkDate = today;
    const todayStr = format(today, "yyyy-MM-dd");
    if ((activityMap.get(todayStr) || 0) === 0) {
      checkDate = subDays(today, 1);
    }

    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if ((activityMap.get(dateStr) || 0) > 0) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return {
      totalValue,
      avgValue,
      bestDay,
      currentStreak,
      activeDays: activityMap.size
    };
  }, [allActivities]);

  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const end = startOfToday();
    const start = subDays(end, days - 1);
    
    const interval = eachDayOfInterval({ start, end });
    
    return interval.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dataPoint: any = {
        date: format(date, "MM/dd"),
        fullDate: dateStr
      };

      if (selectedProject) {
        const activity = selectedProject.activities.find(a => a.date === dateStr);
        dataPoint.value = activity ? Number(activity.value) : 0;
      } else {
        // Stacked data for all projects
        projects.forEach(p => {
          const activity = p.activities.find(a => a.date === dateStr);
          dataPoint[p.title] = activity ? Number(activity.value) : 0;
        });
        dataPoint.total = projects.reduce((sum, p) => sum + (dataPoint[p.title] || 0), 0);
      }

      return dataPoint;
    });
  }, [projects, selectedProject, timeRange]);

  const distributionData = useMemo(() => {
    if (selectedProjectId !== "all") return [];
    
    return projects.map((p, i) => ({
      name: p.title,
      value: p.activities.reduce((sum, a) => sum + Number(a.value), 0),
      color: COLORS[i % COLORS.length]
    })).filter(d => d.value > 0);
  }, [projects, selectedProjectId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="プロジェクトを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのボード</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="期間" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">過去7日間</SelectItem>
              <SelectItem value="30">過去30日間</SelectItem>
              <SelectItem value="90">過去90日間</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">合計スコア</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeDays} 日間の活動記録
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">現在の継続</CardTitle>
            <Flame className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} 日</div>
            <p className="text-xs text-muted-foreground mt-1">
              継続は力なり！
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">1日平均</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgValue.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              1回あたりの平均スコア
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">最高記録</CardTitle>
            <Target className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.bestDay ? Number(stats.bestDay.value).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-ellipsis overflow-hidden whitespace-nowrap">
              {stats.bestDay ? format(parseISO(stats.bestDay.date), "yyyy/MM/dd") : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              アクティビティ推移
            </CardTitle>
            <CardDescription>
              {timeRange}日間の活動状況
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                {selectedProject ? (
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--primary)" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={2}
                  />
                ) : (
                  projects.map((p, i) => (
                    <Area 
                      key={p.id}
                      type="monotone" 
                      dataKey={p.title} 
                      stackId="1"
                      stroke={COLORS[i % COLORS.length]} 
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.4}
                    />
                  ))
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution or Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {selectedProjectId === "all" ? (
                <><PieChartIcon className="w-4 h-4" /> プロジェクト別割合</>
              ) : (
                <><BarChart3 className="w-4 h-4" /> 週別サマリー</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            {selectedProjectId === "all" ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">このプロジェクトの全期間の統計</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold">総記録数</p>
                    <p className="text-xl font-bold">{selectedProject?.activities.length}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold">総計</p>
                    <p className="text-xl font-bold">{stats.totalValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl text-center border border-primary/20">
                  <p className="text-xs text-primary uppercase font-bold">最高記録</p>
                  <p className="text-2xl font-black text-primary">
                    {stats.bestDay ? Number(stats.bestDay.value).toLocaleString() : 0}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
