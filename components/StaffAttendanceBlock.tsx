"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coffee, LogIn, LogOut, Play, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase";

function toIST(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function msToHMS(ms: number) {
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return {
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
    };
}

type Props = { staffId: string };

export default function StaffAttendanceBlock({ staffId }: Props) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());

    const { data: status } = useQuery({
        queryKey: ["attendance-status", staffId],
        queryFn: async () => {
            const { data } = await supabase
                .from("staff_attendance_status")
                .select("*")
                .eq("staff_id", staffId)
                .maybeSingle();
            return data;
        },
        refetchInterval: 30_000,
    });

    const { data: sessions = [] } = useQuery({
        queryKey: ["attendance-sessions", staffId, today],
        queryFn: async () => {
            const { data } = await supabase
                .from("attendance_sessions")
                .select("*")
                .eq("staff_id", staffId)
                .eq("attendance_date", today)
                .order("created_at", { ascending: true });
            return data || [];
        },
    });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["attendance-status"] });
        queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
    };

    const post = (url: string) => async () => {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ staffId }),
        });
        if (!res.ok) throw new Error(await res.text());
    };

    const checkIn       = useMutation({ mutationFn: post("/api/staff/check-in"),       onSuccess: refresh });
    const goBreak       = useMutation({ mutationFn: post("/api/staff/break"),           onSuccess: refresh });
    const resume        = useMutation({ mutationFn: post("/api/staff/resume"),          onSuccess: refresh });
    const finalCheckout = useMutation({ mutationFn: post("/api/staff/final-checkout"), onSuccess: refresh });

    const loading = checkIn.isPending || goBreak.isPending || resume.isPending || finalCheckout.isPending;

    // Live elapsed time (only ticks when active)
    const getWorkedMs = () => {
        let total = 0;
        (sessions as any[]).forEach((s) => {
            if (!s.start_time) return;
            const start = new Date(s.start_time).getTime();
            const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
            total += end - start;
        });
        return total;
    };

    const [workedMs, setWorkedMs] = useState(0);
    const currentStatus = status?.current_status || "offline";

    useEffect(() => {
        setWorkedMs(getWorkedMs());
        if (currentStatus !== "active") return;
        const iv = setInterval(() => setWorkedMs(getWorkedMs()), 1000);
        return () => clearInterval(iv);
    }, [sessions, currentStatus]);

    const { h, m, s } = msToHMS(workedMs);
    const checkInTime = (sessions as any[])[0]?.start_time;
    const totalHours = workedMs / 3_600_000;

    // ── OFFLINE ──────────────────────────────────────────────────────────────
    if (currentStatus === "offline") {
        return (
            <div className="mb-5 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="px-6 pt-6 pb-2 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <span className="text-zinc-400 font-medium">Not checked in</span>
                </div>

                <div className="px-6 pb-6 pt-4">
                    <p className="text-zinc-500 text-sm mb-6">
                        Tap below to start your shift and begin tracking your hours.
                    </p>
                    <button
                        onClick={() => checkIn.mutate()}
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                        {loading ? (
                            <span className="animate-pulse">Starting…</span>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Check In
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ── ACTIVE ───────────────────────────────────────────────────────────────
    if (currentStatus === "active") {
        return (
            <div className="mb-5 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-400 font-semibold">Working</span>
                    </div>
                    {checkInTime && (
                        <span className="text-zinc-500 text-sm">
                            Since {toIST(checkInTime)}
                        </span>
                    )}
                </div>

                {/* Big timer */}
                <div className="px-6 pt-5 pb-4">
                    <div className="flex items-end gap-1">
                        <span className="text-6xl font-bold text-white tabular-nums tracking-tight">{h}</span>
                        <span className="text-4xl text-zinc-500 mb-1">:</span>
                        <span className="text-6xl font-bold text-white tabular-nums tracking-tight">{m}</span>
                        <span className="text-4xl text-zinc-500 mb-1">:</span>
                        <span className="text-6xl font-bold text-zinc-400 tabular-nums tracking-tight">{s}</span>
                    </div>
                    {totalHours >= 8 && (
                        <p className="mt-2 text-emerald-400 text-sm font-medium">
                            Overtime eligible
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                    <button
                        onClick={() => goBreak.mutate()}
                        disabled={loading}
                        className="h-13 py-3.5 rounded-2xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 active:scale-95 transition-all text-yellow-400 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Coffee className="w-4 h-4" />
                        Take Break
                    </button>
                    <button
                        onClick={() => finalCheckout.mutate()}
                        disabled={loading}
                        className="h-13 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <LogOut className="w-4 h-4" />
                        Check Out
                    </button>
                </div>

                {/* Session log */}
                {(sessions as any[]).length > 0 && (
                    <div className="border-t border-zinc-800 px-5 py-4 space-y-2">
                        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Today's sessions</p>
                        {(sessions as any[]).map((session: any, i: number) => (
                            <div key={session.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-zinc-600" />
                                    <span className="text-sm text-zinc-300">
                                        {toIST(session.start_time)}
                                        {" – "}
                                        {session.end_time ? toIST(session.end_time) : <span className="text-emerald-400">Now</span>}
                                    </span>
                                </div>
                                <span className="text-xs text-zinc-500">
                                    {(((session.end_time ? new Date(session.end_time).getTime() : Date.now()) - new Date(session.start_time).getTime()) / 3_600_000).toFixed(1)}h
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── BREAK ─────────────────────────────────────────────────────────────────
    return (
        <div className="mb-5 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="text-yellow-400 font-semibold">On Break</span>
                </div>
                {checkInTime && (
                    <span className="text-zinc-500 text-sm">Since {toIST(checkInTime)}</span>
                )}
            </div>

            {/* Worked so far */}
            <div className="px-6 pt-5 pb-2">
                <p className="text-zinc-500 text-xs mb-1">Worked so far</p>
                <div className="flex items-end gap-1">
                    <span className="text-5xl font-bold text-zinc-300 tabular-nums">{h}</span>
                    <span className="text-3xl text-zinc-600 mb-1">:</span>
                    <span className="text-5xl font-bold text-zinc-300 tabular-nums">{m}</span>
                    <span className="text-3xl text-zinc-600 mb-1">:</span>
                    <span className="text-5xl font-bold text-zinc-500 tabular-nums">{s}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-5 grid grid-cols-2 gap-3">
                <button
                    onClick={() => resume.mutate()}
                    disabled={loading}
                    className="h-13 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    <Play className="w-4 h-4 fill-white" />
                    Resume
                </button>
                <button
                    onClick={() => finalCheckout.mutate()}
                    disabled={loading}
                    className="h-13 py-3.5 rounded-2xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 active:scale-95 transition-all text-orange-400 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    <LogOut className="w-4 h-4" />
                    Check Out
                </button>
            </div>
        </div>
    );
}
