import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "teal" | "emerald" | "emergency";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-teal-700 text-white hover:bg-teal-800": variant === "default",
          "border-transparent bg-teal-100 text-teal-800 hover:bg-teal-200": variant === "teal",
          "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200": variant === "emerald",
          "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200": variant === "secondary",
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200": variant === "destructive",
          "border-red-300 bg-red-600 text-white font-bold animate-pulse": variant === "emergency",
          "text-slate-950 border border-slate-200": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
