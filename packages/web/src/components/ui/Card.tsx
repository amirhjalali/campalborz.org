"use client";

import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}

const variantClasses = {
  default: "bg-warm-white shadow-[0_4px_20px_rgba(160,82,45,0.08),0_8px_40px_rgba(212,175,55,0.06)] border border-dust-khaki/20 backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(160,82,45,0.12),0_12px_50px_rgba(212,175,55,0.08)] hover:border-antique-gold/40 transition-all duration-500 group",
  bordered: "bg-warm-white border-2 border-dust-khaki/30 hover:border-antique-gold/50 transition-all duration-300",
  elevated: "bg-warm-white shadow-[0_8px_30px_rgba(160,82,45,0.12),0_12px_50px_rgba(212,175,55,0.08)] border border-dust-khaki/20 backdrop-blur-sm hover:shadow-[0_12px_40px_rgba(160,82,45,0.15),0_16px_60px_rgba(212,175,55,0.1)] hover:border-antique-gold/50 transition-all duration-500 group",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "relative rounded-2xl overflow-hidden",
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-antique-gold/5 via-transparent to-burnt-sienna/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("border-b border-dust-khaki/30 pb-4 mb-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = "h3", className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={clsx("text-lg font-display font-semibold text-desert-night", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = "CardTitle";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("text-desert-night/70 font-body", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("border-t border-dust-khaki/30 pt-4 mt-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";