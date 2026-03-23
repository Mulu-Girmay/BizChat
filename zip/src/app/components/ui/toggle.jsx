"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover-muted hover-muted-foreground disabled-events-none disabled-50 data-[state=on]-accent data-[state=on]-accent-foreground [&_svg]:events-none [&_svg([class*='size-'])]:4 [&_svg]:0 focus-visible-ring focus-visible-ring/50 focus-visible-[3px] outline-none transition-[color,box-shadow] aria-invalid-destructive/20 dark:invalid-destructive/40 aria-invalid-destructive whitespace-nowrap",
  {
    variants,
      size,
    },
    defaultVariants,
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props }) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };


