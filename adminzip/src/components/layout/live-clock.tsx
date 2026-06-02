import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString("en-GB", { 
    weekday: "long",
    day: "2-digit", 
    month: "long", 
    year: "numeric" 
  });
  const timeStr = time.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit", 
    hour12: true 
  });

  return (
    <div className="flex items-center gap-2.5 bg-background border shadow-sm rounded-lg px-3 py-1.5 h-11">
      <div className="text-cyan-500">
        <Calendar className="h-5 w-5" />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
          {dateStr}
        </div>
        <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 tabular-nums">
          {timeStr}
        </div>
      </div>
    </div>
  );
}
