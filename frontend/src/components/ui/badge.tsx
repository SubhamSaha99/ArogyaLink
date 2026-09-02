import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "teal"
    | "emerald"
    | "cyan"
    | "warning"
    | "verified"
    | "purple"
    | "emergency";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
        {
          "border-transparent bg-teal-700 text-white hover:bg-teal-800 shadow-2xs":
            variant === "default",
          "border-teal-200 bg-teal-50 text-teal-800 border":
            variant === "teal",
          "border-emerald-200 bg-emerald-50 text-emerald-800 border":
            variant === "emerald",
          "border-cyan-200 bg-cyan-50 text-cyan-800 border":
            variant === "cyan",
          "border-purple-200 bg-purple-50 text-purple-800 border":
            variant === "purple",
          "border-amber-200 bg-amber-50 text-amber-800 border":
            variant === "warning",
          "border-emerald-200 bg-emerald-50/90 text-emerald-800 font-bold border flex items-center gap-1":
            variant === "verified",
          "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200/80":
            variant === "secondary",
          "border-red-200 bg-red-50 text-red-700 border":
            variant === "destructive",
          "border-red-300 bg-red-600 text-white font-bold animate-pulse":
            variant === "emergency",
          "text-slate-700 border border-slate-200/80 bg-white":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
