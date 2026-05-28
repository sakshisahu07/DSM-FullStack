import { MessageSquare, MapPin } from "lucide-react";

export function LiveSupportBadges({ 
  onClickChat, 
  onClickTracking 
}: { 
  onClickChat?: () => void; 
  onClickTracking?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Live Tracking */}
      <div 
        onClick={onClickTracking}
        className="flex items-center gap-2 bg-background border shadow-sm rounded-lg px-3 h-11 hover:border-primary/40 transition-colors group cursor-pointer"
      >

        <div className="h-6 w-6 rounded bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          <MapPin className="h-4 w-4" />
        </div>
        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
          Live Order Tracking
        </span>
        <div className="ml-1 flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm border border-emerald-200 dark:border-emerald-800"></span>
        </div>
      </div>

      {/* Live Chat Support */}

      <div 
        onClick={onClickChat}
        className="flex items-center gap-2 bg-background border shadow-sm rounded-lg px-3 h-11 hover:border-primary/40 transition-colors group cursor-pointer"
      >

        <div className="h-6 w-6 rounded bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Live Chat</span>
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Support</span>
        </div>
        <div className="ml-1 flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm border border-emerald-200 dark:border-emerald-800"></span>
        </div>
      </div>
    </div>
  );
}
