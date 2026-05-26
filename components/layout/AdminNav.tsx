"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock3,
  Wallet,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Home",
  },
  {
    href: "/admin/attendance",
    icon: Clock3,
    label: "Attendance",
  },
  {
    href: "/admin/salary",
    icon: Wallet,
    label: "Salary",
  },
  {
    href: "/admin/reports",
    icon: BarChart3,
    label: "Reports",
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border bottom-nav">
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-px rounded-xl transition-all duration-200 min-w-[56px]",
                active
                  ? "text-gold"
                  : "text-ink-muted hover:text-ink-secondary"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-all duration-200",
                active ? "bg-gold/15" : ""
              )}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-wide",
                active ? "text-gold" : "text-ink-muted"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
