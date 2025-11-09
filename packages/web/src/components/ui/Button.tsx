"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
  children: ReactNode;
}

const variantClasses = {
  primary: "relative overflow-hidden bg-gradient-to-r from-burnt-sienna via-antique-gold to-burnt-sienna bg-[length:200%_100%] text-warm-white font-bold shadow-[0_4px_15px_rgba(160,82,45,0.4),0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_25px_rgba(160,82,45,0.5),0_0_40px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-antique-gold/50 focus:ring-offset-2 focus:ring-offset-warm-white before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
  secondary: "relative overflow-hidden bg-gradient-to-r from-antique-gold via-royal-gold to-antique-gold bg-[length:200%_100%] text-desert-night font-bold shadow-[0_4px_15px_rgba(212,175,55,0.4),0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.5),0_0_40px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-royal-gold/50 focus:ring-offset-2 focus:ring-offset-warm-white before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
  outline: "border-2 border-dust-khaki/50 text-burnt-sienna bg-warm-white/80 backdrop-blur-sm hover:bg-desert-sand/30 hover:border-antique-gold/70 focus:ring-2 focus:ring-antique-gold/50 focus:ring-offset-2 focus:ring-offset-warm-white transition-all duration-300",
  ghost: "text-burnt-sienna hover:text-desert-night hover:bg-desert-sand/30 focus:ring-2 focus:ring-antique-gold/50 focus:ring-offset-2 focus:ring-offset-warm-white transition-all duration-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all duration-300",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      asChild = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const buttonClasses = clsx(
      // Base styles
      "inline-flex items-center justify-center font-ui font-semibold rounded-xl transition-all duration-300",
      "focus:outline-none",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
      
      // Variant styles
      variantClasses[variant],
      
      // Size styles
      sizeClasses[size],
      
      // Custom classes
      className
    );

    if (asChild) {
      // Return children with button styles applied
      return children;
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <svg
            className={clsx("animate-spin relative z-10", {
              "w-3 h-3": size === "sm",
              "w-4 h-4": size === "md",
              "w-5 h-5": size === "lg",
            })}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!isLoading && leftIcon && (
          <span className={clsx("relative z-10", {
            "mr-1.5": size === "sm",
            "mr-2": size === "md" || size === "lg",
          })}>
            {leftIcon}
          </span>
        )}

        <span className={clsx("relative z-10", isLoading ? "ml-2" : undefined)}>
          {children}
        </span>

        {!isLoading && rightIcon && (
          <span className={clsx("relative z-10", {
            "ml-1.5": size === "sm",
            "ml-2": size === "md" || size === "lg",
          })}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";