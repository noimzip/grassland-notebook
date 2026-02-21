import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  format, 
  parseISO, 
  getMonth, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval 
} from "date-fns";
import { ja } from "date-fns/locale";
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Github,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

import { useGitHubAuth } from "@/hooks/use-github-auth";
import { GitHubSettings } from "./github-settings";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMultiYearContributions } from "@/lib/github-api-v2";
import type { YearlyContributionData } from "@/lib/github-api-v2";
import { cn } from "@/lib/utils";

// --- Types & Interfaces ---

interface MonthlyData {
  month: string;
  [key: string]: number | string;
}

interface YearStats {
  year: number;
  total: number;
  maxDay: number;
  activeDays: number;
  consistency: number;
  peakMonth: string;
  yoyGrowth?: number;
}

// --- Helper Functions ---

const processMonthlyData = (yearlyData: YearlyContributionData[]): MonthlyData[] => {
  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date())
  }).map(d => format(d, "MMM", { locale: ja }));

  return months.map((monthName, index) => {
    const entry: MonthlyData = { month: monthName };
    
    yearlyData.forEach(({ year, calendar }) => {
      let monthlyTotal = 0;
      calendar.weeks.forEach(week => {
        week.contributionDays.forEach(day => {
          const date = parseISO(day.date);
          if (getMonth(date) === index) {
            monthlyTotal += day.contributionCount;
          }
        });
      });
      entry[year.toString()] = monthlyTotal;
    });

    return entry;
  });
};

const calculateYearStats = (data: YearlyContributionData[]): YearStats[] => {
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  
  return sortedData.map((item, index) => {
    const { year, calendar } = item;
    const allDays = calendar.weeks.flatMap(w => w.contributionDays);
    
    const total = calendar.totalContributions;
    const activeDays = allDays.filter(d => d.contributionCount > 0).length;
    const consistency = allDays.length > 0 ? (activeDays / allDays.length) * 100 : 0;
    
    const monthlyCounts = new Array(12).fill(0);
    allDays.forEach(day => {
      const month = getMonth(parseISO(day.date));
      monthlyCounts[month] += day.contributionCount;
    });
    const peakMonthIndex = monthlyCounts.indexOf(Math.max(...monthlyCounts));
    const peakMonth = format(new Date(year, peakMonthIndex, 1), "MMM", { locale: ja });

    let yoyGrowth: number | undefined = undefined;
    if (index > 0) {
      const prevYearTotal = sortedData[index - 1].calendar.totalContributions;
      if (prevYearTotal > 0) {
        yoyGrowth = ((total - prevYearTotal) / prevYearTotal) * 100;
      }
    }

    return {
      year,
      total,
      maxDay: Math.max(...allDays.map(d => d.contributionCount), 0),
      activeDays,
      consistency,
      peakMonth,
      yoyGrowth
    };
  }).sort((a, b) => b.year - a.year);
};

// --- Main Component ---

export function YearlyAnalysisDashboard() {
  const { username: storedUser, token: storedToken, isConfigured } = useGitHubAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<YearlyContributionData[]>([]);
  const [stats, setStats] = useState<YearStats[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  const [compareYear1, setCompareYear1] = useState<string>("");
  const [compareYear2, setCompareYear2] = useState<string>("");

  const handleFetch = async () => {
    if (!storedUser || !storedToken) return;

    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
      const result = await fetchMultiYearContributions(storedUser, storedToken, years);
      
      setData(result);
      setStats(calculateYearStats(result));
      setMonthlyData(processMonthlyData(result));
      
      if (result.length >= 2) {
        setCompareYear1(result[0].year.toString());
        setCompareYear2(result[1].year.toString());
      } else if (result.length === 1) {
        setCompareYear1(result[0].year.toString());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfigured && data.length === 0 && !loading) {
      handleFetch();
    }
  }, [isConfigured]);

  const bestYear = useMemo(() => {
    if (stats.length === 0) return null;
    return stats.reduce((prev, current) => (prev.total > current.total ? prev : current));
  }, [stats]);

  const comparisonData = useMemo(() => {
    if (!monthlyData.length || !compareYear1 || !compareYear2) return [];
    return monthlyData.map(d => ({
      name: d.month,
      [compareYear1]: d[compareYear1] || 0,
      [compareYear2]: d[compareYear2] || 0,
    }));
  }, [monthlyData, compareYear1, compareYear2]);

  if (!isConfigured && data.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <Calendar className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">複数年分析には連携が必要です</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              過去5年間のトレンドを分析するために、GitHub 連携を設定してください。
            </p>
          </div>
          <GitHubSettings />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 w-full max-w-7xl mx-auto">
      {/* Header with Sync Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
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
          全期間のデータを再同期
        </Button>
      </div>

      {loading && data.length === 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : data.length > 0 ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Year</CardTitle>
                <Trophy className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bestYear?.year}</div>
                <p className="text-xs text-muted-foreground">
                  {bestYear?.total.toLocaleString()} contributions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total (Last 5 Years)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg. {Math.round(stats.reduce((acc, curr) => acc + curr.total, 0) / (stats.length || 1)).toLocaleString()} / year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Consistent</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.length > 0 ? stats.reduce((prev, curr) => prev.consistency > curr.consistency ? prev : curr).year : "-"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.length > 0 ? stats.reduce((prev, curr) => prev.consistency > curr.consistency ? prev : curr).consistency.toFixed(1) : "0"}% active days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {stats.length > 0 && stats[0].yoyGrowth ? `${stats[0].yoyGrowth > 0 ? "+" : ""}${stats[0].yoyGrowth.toFixed(1)}%` : "-"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">vs Previous Year</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="comparison" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="comparison">Year Comparison</TabsTrigger>
                <TabsTrigger value="trends">Growth Trends</TabsTrigger>
                <TabsTrigger value="details">Yearly Details</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Select value={compareYear1} onValueChange={setCompareYear1}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stats.map(s => <SelectItem key={s.year} value={s.year.toString()}>{s.year}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="self-center text-muted-foreground text-sm font-bold px-1 text-[10px] uppercase">vs</span>
                <Select value={compareYear2} onValueChange={setCompareYear2}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stats.map(s => <SelectItem key={s.year} value={s.year.toString()}>{s.year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Contribution Comparison</CardTitle>
                  <CardDescription>{compareYear1} vs {compareYear2}</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={comparisonData}>
                      <defs>
                        <linearGradient id="colorYear1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorYear2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey={compareYear1} 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorYear1)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey={compareYear2} 
                        stroke="#82ca9d" 
                        fillOpacity={1} 
                        fill="url(#colorYear2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Contributions per Year</CardTitle>
                  <CardDescription>Long-term activity trend analysis</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...stats].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <RechartsTooltip 
                        cursor={{fill: 'var(--muted)', opacity: 0.2}}
                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                      <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <ScrollArea className="h-[600px] w-full pr-4">
                <div className="grid gap-4">
                  {stats.map((stat) => (
                    <Card key={stat.year}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle className="text-xl">{stat.year}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {stat.yoyGrowth !== undefined && (
                              <span className={stat.yoyGrowth >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                {stat.yoyGrowth > 0 ? <ArrowUpRight className="inline w-3 h-3" /> : <ArrowDownRight className="inline w-3 h-3" />}
                                {Math.abs(stat.yoyGrowth).toFixed(1)}% YoY
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stat.total.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">contributions</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground">Peak Month</div>
                            <div className="text-lg font-bold mt-1">{stat.peakMonth}</div>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground">Active Days</div>
                            <div className="text-lg font-bold mt-1">{stat.activeDays}</div>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground">Consistency</div>
                            <div className="text-lg font-bold mt-1">{stat.consistency.toFixed(1)}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}

