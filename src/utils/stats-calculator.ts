import { isSameDay, startOfToday, subDays } from "date-fns";

export type ContributionEntry = {
  date: string; // ISO format: YYYY-MM-DD
  count: number;
};

export type Stats = {
  totalContributions: number;
  currentStreak: number;
  maxStreak: number;
  bestDay: {
    date: string;
    count: number;
  } | null;
};

export function calculateStats(data: ContributionEntry[]): Stats {
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const today = startOfToday();
  
  let totalContributions = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let bestDay: { date: string; count: number } | null = null;

  const dataMap = new Map(data.map(item => [item.date, item.count]));

  // Calculate total and best day
  data.forEach(item => {
    totalContributions += item.count;
    if (!bestDay || item.count > bestDay.count) {
      bestDay = { date: item.date, count: item.count };
    }
  });

  // Calculate Max Streak
  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i].count > 0) {
      tempStreak++;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate Current Streak
  let checkDay = today;
  const todayStr = today.toISOString().split('T')[0];
  const hasActivityToday = (dataMap.get(todayStr) || 0) > 0;
  
  // If no activity today, check yesterday
  if (!hasActivityToday) {
    checkDay = subDays(today, 1);
  }

  while (true) {
    const dateStr = checkDay.toISOString().split('T')[0];
    const count = dataMap.get(dateStr) || 0;
    
    if (count > 0) {
      currentStreak++;
      checkDay = subDays(checkDay, 1);
    } else {
      break;
    }
  }

  return {
    totalContributions,
    currentStreak,
    maxStreak,
    bestDay
  };
}
