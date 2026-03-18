import React, { useMemo, useEffect, useState } from 'react';
import { format, startOfDay, getYear, eachDayOfInterval, startOfYear, endOfYear, getMonth } from 'date-fns';
import { useAuthStore } from '../store/authStore';

interface HeatmapDay {
  date: Date;
  count: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ActivityHeatmap: React.FC = () => {
  const { user } = useAuthStore();
  const [scores, setScores] = useState<{ date: string; score: number }[]>([]);
  
  const currentYear = getYear(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  useEffect(() => {
    // Only fetch if logged in and not a guest
    if (!user || user.isGuest) return;

    const fetchScores = async () => {
      try {
        const response = await fetch(`${API_URL}/sync/daily-scores/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.scores) {
            setScores(data.scores);
          }
        }
      } catch (err) {
        console.error('Failed to fetch heatmap data', err);
      }
    };
    
    fetchScores();
  }, [user]);

  // Generate range of selectable years
  const availableYears = useMemo(() => {
    if (!user || !user.createdAt) return [currentYear];
    const startYear = getYear(new Date(user.createdAt));
    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }
    return years.length > 0 ? years : [currentYear];
  }, [user, currentYear]);

  // Generate data for the selected year
  const heatmapData = useMemo(() => {
    const data: HeatmapDay[] = [];
    const isCurrentYear = selectedYear === currentYear;
    
    // If it's the current year, show up to today. Otherwise, show the full year.
    const start = startOfYear(new Date(selectedYear, 0, 1));
    const end = isCurrentYear ? startOfDay(new Date()) : endOfYear(new Date(selectedYear, 0, 1));
    
    const daysInYear = eachDayOfInterval({ start, end });

    const scoreMap = new Map<string, number>();
    scores.forEach(s => {
      scoreMap.set(s.date, s.score);
    });

    daysInYear.forEach(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const score = scoreMap.get(dateStr) || 0;
      
      let count = 0;
      if (score > 0) count = 1;
      if (score > 1000) count = 2;
      if (score > 5000) count = 3;
      if (score > 10000) count = 4;

      data.push({
        date: d,
        count
      });
    });
    
    return data;
  }, [scores, selectedYear, currentYear]);

  // Structure data into weeks
  const weeks = useMemo(() => {
    const structuredWeeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    // Pad the beginning of the year so the layout matches standard calendar weeks (starting on Sunday/Monday depending on locale, we use 0-6 index)
    if (heatmapData.length > 0) {
      const firstDayOffset = heatmapData[0].date.getDay(); // Sunday is 0
      for (let i = 0; i < firstDayOffset; i++) {
        // Push empty days to pad the first week
        currentWeek.push({ date: new Date(0), count: -1 });
      }
    }

    heatmapData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        structuredWeeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      // Pad the end of the year
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(0), count: -1 });
      }
      structuredWeeks.push(currentWeek);
    }

    return structuredWeeks;
  }, [heatmapData]);

  // Generate month labels mapping
  const monthLabels = useMemo(() => {
    const labels: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
      // Find the first valid day in this week
      const validDay = week.find((d) => d.count !== -1);
      if (validDay) {
        const month = getMonth(validDay.date);
        if (month !== lastMonth) {
          labels.push({ name: format(validDay.date, 'MMM'), weekIndex: index });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  const getColorClass = (count: number) => {
    switch (count) {
      case -1: return 'bg-transparent'; // padding cells
      case 0: return 'bg-brand-100 dark:bg-brand-800';
      case 1: return 'bg-brand-blue-200 dark:bg-brand-blue-600';
      case 2: return 'bg-brand-blue-300 dark:bg-brand-blue-500';
      case 3: return 'bg-brand-blue-400 dark:bg-brand-blue-400';
      case 4: return 'bg-brand-blue-600 dark:bg-brand-blue-300';
      default: return 'bg-brand-100 dark:bg-brand-800';
    }
  };

  if (!user || user.isGuest) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 h-48">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Please sign in to view your activity heatmap</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
        {/* Heatmap header: Month labels */}
        <div className="relative h-6 w-full hidden sm:block">
          {monthLabels.map((label, i) => (
             // Approximate width of a cell + gap is about 20px (w-4 + gap-1)
            <div 
              key={i} 
              className="absolute text-xs text-gray-500 dark:text-gray-400"
              style={{ left: `${label.weekIndex * (16 + 4)}px` }} 
            >
              {label.name}
            </div>
          ))}
        </div>

        {/* Heatmap Area */}
        <div className="flex gap-1 overflow-x-auto pb-4 custom-scrollbar">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-4 h-4 rounded-sm ${getColorClass(day.count)} ${day.count !== -1 ? 'transition-all hover:ring-2 hover:ring-brand-blue-500 cursor-pointer' : ''}`}
                  title={day.count !== -1 ? `${format(day.date, 'MMM d, yyyy')}: ${day.count} activities` : undefined}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Heatmap Footer Legend */}
        <div className="flex items-center justify-end text-xs text-brand-800 dark:text-gray-400 space-x-2">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColorClass(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Right Column: Year Selector */}
      <div className="w-full md:w-24 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto">
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              selectedYear === year 
                ? 'bg-brand-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityHeatmap;
