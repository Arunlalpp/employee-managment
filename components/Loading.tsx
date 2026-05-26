"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export default function Loading({ className, label = "OGGY", ...props }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-300 to-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.2)]">
          <span className="absolute inset-0 rounded-full border border-white/10" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-white/70" />
          <span className="relative text-3xl font-black uppercase tracking-tight text-black">OG</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm uppercase tracking-[0.35em] text-zinc-400">Loading</span>
          <span className="text-2xl font-semibold uppercase tracking-[0.2em] text-white">{label}</span>
        </div>
      </div>
    </div>
  );
}
