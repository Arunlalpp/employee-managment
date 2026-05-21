import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    subtitle?: string;
    className?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    iconColor = "text-gold",
    iconBg = "bg-gold/10",
    subtitle,
    className,
}: StatCardProps) {
    return (
        <div className={cn("glass rounded-2xl p-4", className)}>
            <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2.5 rounded-xl", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} strokeWidth={1.8} />
                </div>
            </div>
            <p className="text-ink-muted text-xs tracking-wider uppercase font-medium mb-1">{title}</p>
            <p className="text-ink-primary text-2xl font-semibold" style={{ fontFamily: "var(--font-cormorant)" }}>
                {value}
            </p>
            {subtitle && (
                <p className="text-ink-muted text-xs mt-1">{subtitle}</p>
            )}
        </div>
    );
}
