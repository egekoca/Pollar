import { useMemo } from "react";
import { VotePool } from "../types/poll";

/**
 * Custom hook for preparing chart data from poll history
 * @param localPool - VotePool object with history and options
 * @returns Chart data array for recharts
 */
export function usePollChartData(localPool: VotePool | null): Array<Record<string, any>> {
  const chartData = useMemo(() => {
    if (!localPool) return [];

    const historyPoints = localPool.history.map((entry) => {
      const dataPoint: Record<string, any> = {
        date: new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      entry.options.forEach((opt) => {
        const option = localPool.options.find((o) => o.id === opt.optionId);
        if (option) {
          dataPoint[option.name] = opt.percentage;
        }
      });
      return dataPoint;
    });

    const currentDataPoint: Record<string, any> = { date: "Now" };
    localPool.options.forEach((opt) => {
      currentDataPoint[opt.name] = opt.percentage;
    });

    return [...historyPoints, currentDataPoint];
  }, [localPool]);

  return chartData;
}

