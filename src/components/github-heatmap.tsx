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
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col gap-2">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-[3px] min-w-max p-1">
            {calendar.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                {week.contributionDays.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div 
                        className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1"
                        style={{ 
                          backgroundColor: day.contributionCount > 0 
                            ? day.color 
                            : 'rgba(128, 128, 128, 0.1)' 
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-center">
                        <p className="font-bold">{day.contributionCount} contributions</p>
                        <p className="text-[10px] opacity-70">
                          {format(parseISO(day.date), "yyyy/MM/dd")}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 text-[10px] text-muted-foreground">
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
