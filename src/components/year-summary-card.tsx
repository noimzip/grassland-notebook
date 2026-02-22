import React from "react";
import { Award, Flame, Calendar, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface YearSummaryProps {
  year: number;
  total: number;
  activeDays: number;
  maxDay: number;
}

export function YearSummaryCard({ year, total, activeDays, maxDay }: YearSummaryProps) {
  const consistency = ((activeDays / 365) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/20">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total</p>
          <p className="text-sm font-bold leading-none mt-1">{total.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/20">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active</p>
          <p className="text-sm font-bold leading-none mt-1">{activeDays} days</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/20">
        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Consistency</p>
          <p className="text-sm font-bold leading-none mt-1">{consistency}%</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/20">
        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Peak</p>
          <p className="text-sm font-bold leading-none mt-1">{maxDay} pts</p>
        </div>
      </div>
    </div>
  );
}
