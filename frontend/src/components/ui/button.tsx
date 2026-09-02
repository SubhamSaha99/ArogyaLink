import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "emergency"
    | "emerald"
    | "teal"
    | "gradient"
    | "cyan";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98] select-none",
          {
            "bg-teal-700 text-white hover:bg-teal-800 shadow-xs hover:shadow-md shadow-teal-700/20":
              variant === "default" || variant === "teal",
            "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs hover:shadow-md shadow-emerald-600/20":
              variant === "emerald",
            "bg-linear-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 shadow-xs hover:shadow-md shadow-teal-600/25 font-bold":
              variant === "gradient",
            "bg-cyan-600 text-white hover:bg-cyan-700 shadow-xs shadow-cyan-600/20":
              variant === "cyan",
            "bg-red-600 text-white hover:bg-red-700 shadow-xs shadow-red-600/25 animate-pulse":
              variant === "emergency",
            "bg-red-500 text-white hover:bg-red-600 shadow-xs":
              variant === "destructive",
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs":
              variant === "outline",
            "bg-slate-100 text-slate-900 hover:bg-slate-200/80":
              variant === "secondary",
            "hover:bg-teal-50 hover:text-teal-700 text-slate-600":
              variant === "ghost",
            "text-teal-700 underline-offset-4 hover:underline p-0 h-auto font-medium":
              variant === "link",
          },
          {
            "h-10 px-4 py-2 text-xs": size === "default",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-12 rounded-2xl px-6 text-sm font-bold": size === "lg",
            "h-9 w-9 p-0 rounded-lg": size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
