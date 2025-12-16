import { useState, useEffect } from "react";
import { COUNTDOWN_UPDATE_INTERVAL_MS } from "../constants/appConstants";
import { formatCountdown } from "../utils/pollHelpers";

/**
 * Custom hook for countdown timer
 * Updates current time every second and provides formatted countdown function
 * @returns Object with currentTime and formatCountdown function
 */
export function useCountdown() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, COUNTDOWN_UPDATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const formatCountdownForTime = (endTime: string): string => {
    return formatCountdown(endTime, currentTime);
  };

  return {
    currentTime,
    formatCountdown: formatCountdownForTime,
  };
}


