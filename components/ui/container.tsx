import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Presentational Tailwind container wrapper.
 * Keeps max-width and consistent horizontal padding across pages.
 */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
