import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-dust-khaki/30 bg-warm-white px-3 py-2 text-sm font-body text-desert-night ring-offset-warm-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-desert-night/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-gold/50 focus-visible:ring-offset-2 focus-visible:border-antique-gold/70 hover:border-dust-khaki/50 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
