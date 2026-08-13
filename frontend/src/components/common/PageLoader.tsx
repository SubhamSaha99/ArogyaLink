import React from "react";
import { Activity } from "lucide-react";

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-700/10 flex items-center justify-center text-teal-600 animate-pulse">
          <Activity className="w-8 h-8 animate-bounce" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-teal-500/20 border-t-teal-600 animate-spin"></div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-slate-800 tracking-wide">
          Arogya<span className="text-teal-600">Link</span>
        </p>
        <p className="text-xs text-slate-500">Loading page...</p>
      </div>
    </div>
  );
};

export default PageLoader;
