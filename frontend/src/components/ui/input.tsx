import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, endAdornment, ...props }, ref) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-semibold placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-9",
              endAdornment && "pr-9",
              hasError && "border-red-500 bg-red-50/20 focus-visible:ring-red-500 focus-visible:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {endAdornment}
            </div>
          )}
        </div>
        {errorMessage && (
          <p className="mt-1 text-[11px] text-red-600 font-medium">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
