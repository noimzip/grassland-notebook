import React, { useState, useMemo } from "react";
import { format, parseISO, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import type { Project, ProjectActivityLog } from "../lib/types";
import { Flame, Calendar as CalendarIcon, Trophy } from "lucide-react";

interface ActivityBoardProps {
  project: Project;
  activities: ProjectActivityLog[];
  onUpdate?: () => void;
}

const COLOR_MAP: Record<string, { bg: string, levels: string[] }> = {
  emerald: {
    bg: "bg-emerald-500",
    levels: ["#ebedf0", "#d1fae5", "#6ee7b7", "#10b981", "#047857"]
  },
  blue: {
    bg: "bg-blue-500",
    levels: ["#ebedf0", "#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"]
  },
  indigo: {
    bg: "bg-indigo-500",
    levels: ["#ebedf0", "#e0e7ff", "#a5b4fc", "#6366f1", "#4338ca"]
  },
  orange: {
    bg: "bg-orange-500",
    levels: ["#ebedf0", "#ffedd5", "#fdba74", "#f97316", "#c2410c"]
  },
  rose: {
    bg: "bg-rose-500",
    levels: ["#ebedf0", "#ffe4e6", "#fda4af", "#f43f5e", "#be123c"]
  },
  amber: {
    bg: "bg-amber-500",
    levels: ["#ebedf0", "#fef3c7", "#fcd34d", "#fbbf24", "#d97706"]
  }
};

export function ActivityBoard({ project, activities, onUpdate }: ActivityBoardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Get the last 365 days
  const today = new Date();
  const startDate = subDays(today, 364);
  const calendarDays = useMemo(() => {
    const allDays = eachDayOfInterval({ start: startDate, end: today });
    const startOfCalendar = startOfWeek(startDate);
    const endOfCalendar = endOfWeek(today);
    const calendarInterval = eachDayOfInterval({ start: startOfCalendar, end: endOfCalendar });
    
    // Group by weeks
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    calendarInterval.forEach((date) => {
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return weeks;
  }, [startDate, today]);

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach(a => map.set(a.date, Number(a.value)));
    return map;
  }, [activities]);

  const totalValue = useMemo(() => {
    return activities.reduce((sum, a) => sum + Number(a.value), 0);
  }, [activities]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    let checkDate = today;
    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      const val = activityMap.get(dateStr) || 0;
      if (val > 0) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        if (isSameDay(checkDate, today)) {
          checkDate = subDays(checkDate, 1);
          continue;
        }
        break;
      }
    }
    return streak;
  }, [activityMap, today]);

  const maxVal = Math.max(...Array.from(activityMap.values()), 1);

  const getIntensity = (val: number) => {
    if (val === 0) return 0;
    if (val <= maxVal * 0.25) return 1;
    if (val <= maxVal * 0.5) return 2;
    if (val <= maxVal * 0.75) return 3;
    return 4;
  };

  const colors = COLOR_MAP[project.color] || COLOR_MAP.emerald;

  const handleCellClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setInputValue((activityMap.get(dateStr) || 0).toString());
  };

  const handleUpdateValue = async () => {
    if (!selectedDate) return;
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const value = parseFloat(inputValue) || 0;

      const { error } = await supabase
        .from("activity_logs")
        .upsert({
          project_id: project.id,
          user_id: user.id,
          date: selectedDate,
          value: value
        }, { onConflict: "project_id, date" });

      if (error) throw error;
      
      setSelectedDate(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to update activity log:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
            <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-foreground">{currentStreak}</span>
              <span>days</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-foreground">{totalValue.toLocaleString()}</span>
              <span>total</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={0}>
          <div className="flex flex-col gap-2">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-[3px] min-w-max p-1">
                {calendarDays.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                    {week.map((date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const value = activityMap.get(dateStr) || 0;
                      const intensity = getIntensity(value);
                      const color = colors.levels[intensity];

                      return (
                        <Tooltip key={dateStr}>
                          <TooltipTrigger asChild>
                            <div 
                              onClick={() => handleCellClick(date)}
                              className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1 cursor-pointer"
                              style={{ backgroundColor: color }}
                            />
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className="bg-popover border border-border px-3 py-2 rounded-lg shadow-xl text-xs animate-in fade-in zoom-in duration-200"
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-popover-foreground">
                                {format(date, "yyyy年MM月dd日")}
                              </p>
                              <p className="text-muted-foreground font-medium">
                                {value.toLocaleString()} contributions
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex justify-end items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-[3px]">
                {colors.levels.map((c, i) => (
                  <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{project.title} - 入力</DialogTitle>
            <DialogDescription>
              {selectedDate && format(parseISO(selectedDate), "yyyy年MM月dd日")} の値を入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                値
              </Label>
              <Input
                id="value"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDate(null)}>キャンセル</Button>
            <Button onClick={handleUpdateValue} disabled={isUpdating}>
              {isUpdating ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
