import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function MidnightCountdown() {
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");

  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
      );
      
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const updateTimer = () => {
      setTimeUntilMidnight(calculateTimeUntilMidnight());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 rounded-lg border border-purple-200 dark:border-purple-800">
      <Clock className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-xs font-medium">Gece Yarısına</span>
        <span className="text-sm font-bold font-mono">{timeUntilMidnight}</span>
      </div>
    </div>
  );
}
