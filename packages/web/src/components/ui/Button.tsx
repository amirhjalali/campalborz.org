"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const variantClasses = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
  secondary: "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500",
  outline: "border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50 focus:ring-secondary-500",
  ghost: "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:ring-secondary-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
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
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={clsx(
          // Base styles
          "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Variant styles
          variantClasses[variant],
          
          // Size styles
          sizeClasses[size],
          
          // Custom classes
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <svg
            className={clsx("animate-spin", {
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
          <span className={clsx({
            "mr-1.5": size === "sm",
            "mr-2": size === "md" || size === "lg",
          })}>
            {leftIcon}
          </span>
        )}

        <span className={isLoading ? "ml-2" : undefined}>
          {children}
        </span>

        {!isLoading && rightIcon && (
          <span className={clsx({
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