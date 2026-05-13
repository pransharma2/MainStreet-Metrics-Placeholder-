"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintReportButton({
  className,
  variant = "default",
  label = "Print report",
}: {
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
    >
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}
