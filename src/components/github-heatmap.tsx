import React from "react";
import { format, parseISO } from "date-fns";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import type { GitHubContributionCalendar } from "@/lib/github-api";

interface GitHubHeatmapProps {
  calendar: GitHubContributionCalendar;
}

export function GitHubHeatmap({ calendar }: GitHubHeatmapProps) {
  const total = calendar.totalContributions;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col gap-2">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-[3px] min-w-max p-1">
            {calendar.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                {week.contributionDays.map((day) => {
                  const percentage = total > 0 
                    ? ((day.contributionCount / total) * 100).toFixed(2) 
                    : "0.00";

                  return (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div 
                          className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1 cursor-help"
                          style={{ 
                            backgroundColor: day.contributionCount > 0 
                              ? day.color 
                              : 'rgba(128, 128, 128, 0.1)' 
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="bg-popover border border-border px-3 py-2 rounded-lg shadow-xl text-xs animate-in fade-in zoom-in duration-200"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: day.contributionCount > 0 ? day.color : '#888' }} 
                            />
                            <p className="font-bold text-popover-foreground">
                              {format(parseISO(day.date), "yyyy年MM月dd日")}
                            </p>
                          </div>
                          <p className="text-muted-foreground font-medium flex items-baseline gap-1">
                            <span className="text-foreground text-sm font-black">
                              {day.contributionCount.toLocaleString()}
                            </span>
                            <span className="text-[10px]">contributions</span>
                            {day.contributionCount > 0 && (
                              <span className="text-primary font-bold ml-1">({percentage}%)</span>
                            )}
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
            <div className="w-[10px] h-[10px] rounded-[2px] bg-muted/50" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#9be9a8]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#40c463]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#30a14e]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#216e39]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
