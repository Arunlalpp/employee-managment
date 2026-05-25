"use client";

import { cn } from "@/lib/utils";

interface TabNavProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all",
            activeTab === tab.id
              ? "bg-yellow-500 text-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
