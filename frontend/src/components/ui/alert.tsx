import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "teal";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-2xl border p-4 text-xs [&>svg+div]:-translate-y-0.75 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7 transition-all",
        {
          "bg-white text-slate-900 border-slate-200 shadow-xs": variant === "default",
          "border-red-200 bg-red-50/80 text-red-800 [&>svg]:text-red-600": variant === "destructive",
          "border-emerald-200 bg-emerald-50/80 text-emerald-800 [&>svg]:text-emerald-600": variant === "success",
          "border-amber-200 bg-amber-50/80 text-amber-800 [&>svg]:text-amber-600": variant === "warning",
          "border-cyan-200 bg-cyan-50/80 text-cyan-800 [&>svg]:text-cyan-600": variant === "info",
          "border-teal-200 bg-teal-50/80 text-teal-900 [&>svg]:text-teal-700": variant === "teal",
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight text-xs", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs [&_p]:leading-relaxed opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

