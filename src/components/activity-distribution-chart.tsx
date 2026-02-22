import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { 
  GitPullRequest, 
  GitCommit, 
  MessageSquare, 
  Eye,
  Info
} from "lucide-react";
import type { GitHubActivityDetails } from "@/lib/github-api-details";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityDistributionChartProps {
  details: GitHubActivityDetails;
  className?: string;
}

const COLORS = {
  commits: "#218bff",      // GitHub Blue
  pullRequests: "#8250df", // GitHub Purple
  issues: "#2da44e",       // GitHub Green
  reviews: "#bf3989",      // GitHub Pink/Review
};

// Custom Tooltip Component with Percentage
const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-xl text-xs animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="font-bold text-popover-foreground">{data.name}</p>
        </div>
        <p className="text-muted-foreground font-medium flex items-baseline gap-1">
          <span className="text-foreground text-sm font-black">{data.value.toLocaleString()}</span>
          <span>({percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ActivityDistributionChart({ details, className }: ActivityDistributionChartProps) {
  const data = [
    { name: "Commits", value: details.commits, color: COLORS.commits, icon: GitCommit },
    { name: "Pull Requests", value: details.pullRequests, color: COLORS.pullRequests, icon: GitPullRequest },
    { name: "Issues", value: details.issues, color: COLORS.issues, icon: MessageSquare },
    { name: "Reviews", value: details.reviews, color: COLORS.reviews, icon: Eye },
  ].filter(item => item.value > 0);

  return (
    <Card className={cn("flex flex-col border-border/40 bg-card/50 backdrop-blur-sm shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          活動タイプの分布
        </CardTitle>
        <CardDescription className="text-xs">
          全活動に対する各カテゴリーの割合
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center gap-6 py-6">
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1200}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip total={details.total} />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border/20">
          {data.map((item) => {
            const percentage = ((item.value / details.total) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md" style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground leading-none">
                      {item.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black tabular-nums leading-none">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
