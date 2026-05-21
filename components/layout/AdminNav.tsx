"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  Wallet,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/admin/staff", icon: Users, label: "Staff" },
  { href: "/admin/attendance", icon: Clock, label: "Attendance" },
  { href: "/admin/salary", icon: Wallet, label: "Salary" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border bottom-nav">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[56px]",
                active
                  ? "text-gold"
                  : "text-ink-muted hover:text-ink-secondary"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-ink-muted hover:text-danger transition-all min-w-[56px]"
        >
          <div className="p-1.5 rounded-lg">
            <LogOut className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </nav>
  );
}
