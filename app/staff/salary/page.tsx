"use client";

import { useState, useMemo } from "react";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import { TrendingDown, CalendarDays, Trophy, Clock3 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useMonthAttendance } from "@/lib/hooks/useMonthAttendance";
import { useMonthAdvances, useAdvanceRequests } from "@/lib/hooks/useMonthAdvances";
import { useMonthlyReport } from "@/lib/hooks/useMonthlyReport";
import { createClient } from "@/lib/supabase";

export default function StaffSalary() {
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advanceAmount, setAdvanceAmount] = useState("");
    const [advanceReason, setAdvanceReason] = useState("");
    const [advanceLoading, setAdvanceLoading] = useState(false);

    const queryClient = useQueryClient();
    const { data: user } = useAuth();
    const { data: profile } = useProfile(user?.id);

    const [y, m] = selectedMonth.split("-");
    const monthStart = `${y}-${m}-01`;
    const monthEnd = `${y}-${m}-${new Date(Number(y), Number(m), 0).getDate()}`;

    const { data: attendance = [] } = useMonthAttendance(profile?.id || "", monthStart, monthEnd);
    const { data: advances = [] } = useMonthAdvances(profile?.id || "", monthStart, monthEnd);
    const { data: advanceRequests = [] } = useAdvanceRequests(profile?.id);
    const { data: report } = useMonthlyReport(selectedMonth);

    const supabase = createClient();

    const addAdvanceRequestMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from("advance_requests").insert({
                staff_id: profile!.id,
                amount: Number(advanceAmount),
                reason: advanceReason,
                status: "pending",
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["advance_requests", profile?.id] });
            setShowAdvanceModal(false);
            setAdvanceAmount("");
            setAdvanceReason("");
            alert("Advance request submitted");
        },
    });

    const handleAdvanceRequest = async () => {
        setAdvanceLoading(true);
        try {
            await addAdvanceRequestMutation.mutateAsync();
        } catch (error) {
            console.error(error);
            alert("Failed to submit advance request");
        } finally {
            setAdvanceLoading(false);
        }
    };

    const stats = useMemo(() => {
        const daysPresent = attendance.filter((a: any) => a.is_present).length;
        const allowance = attendance.reduce(
            (sum, item) => sum + Number(item.allowance_earned || 0),
            0
        );
        const overtimeBonus = attendance.reduce(
            (sum, item) => sum + Number(item.overtime_bonus || 0),
            0
        );
        const advanceTotal = advances.reduce((sum, item) => sum + Number(item.amount), 0);
        const salary = Number(profile?.salary || 0);
        const profitBonus = report?.bonus_per_staff || 0;
        const netSalary = salary + allowance + overtimeBonus + profitBonus - advanceTotal;

        return {
            daysPresent,
            allowance,
            overtimeBonus,
            advanceTotal,
            salary,
            profitBonus,
            netSalary,
        };
    }, [attendance, advances, profile?.salary, report]);

    if (!profile) {
        return <div className="p-6 text-white">Loading...</div>;
    }

    const prevMonth = format(subMonths(parseISO(`${selectedMonth}-01`), 1), "yyyy-MM");
    const nextMonth = format(addMonths(parseISO(`${selectedMonth}-01`), 1), "yyyy-MM");
    const currentMonth = format(new Date(), "yyyy-MM");

    return (
        <div className="px-4 pt-14 pb-32 text-white">
            <h1 className="text-3xl font-bold mb-5">My Salary</h1>

            <div className="flex items-center gap-2 mb-5">
                <button
                    onClick={() => setSelectedMonth(prevMonth)}
                    className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800"
                >
                    ‹
                </button>
                <div className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <p className="font-medium">{format(parseISO(`${selectedMonth}-01`), "MMMM yyyy")}</p>
                </div>
                <button
                    disabled={nextMonth > currentMonth}
                    onClick={() => setSelectedMonth(nextMonth)}
                    className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-30"
                >
                    ›
                </button>
            </div>

            <div className="rounded-3xl p-6 mb-5 bg-gradient-to-br from-yellow-900/40 to-zinc-900 border border-yellow-500/20">
                <p className="text-yellow-500 text-xs uppercase tracking-widest mb-2">Net Salary</p>
                <h2 className="text-5xl font-light text-yellow-400">₹{stats.netSalary}</h2>
                <p className="text-zinc-400 text-sm mt-2">Salary after all bonuses & deductions</p>

                <button
                    onClick={() => setShowAdvanceModal(true)}
                    className="w-full mt-5 bg-yellow-500 hover:bg-yellow-400 transition-all text-black font-semibold rounded-2xl py-4"
                >
                    Request Advance
                </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <div className="space-y-4">
                    <Row label="Base Salary" value={`₹${stats.salary}`} />
                    <Row
                        label={`Allowance (${stats.daysPresent} days)`}
                        value={`+₹${stats.allowance}`}
                        color="text-green-500"
                    />
                    <Row
                        label="Overtime Bonus"
                        value={`+₹${stats.overtimeBonus}`}
                        color="text-blue-400"
                    />
                    <Row
                        label="Profit Bonus"
                        value={`+₹${stats.profitBonus}`}
                        color="text-emerald-400"
                    />
                    <Row
                        label="Advance Deduction"
                        value={`-₹${stats.advanceTotal}`}
                        color="text-red-500"
                    />
                    <div className="border-t border-zinc-800 pt-4">
                        <Row
                            label="Net Payable"
                            value={`₹${stats.netSalary}`}
                            color="text-yellow-400"
                            bold
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <StatBox
                    title="Present"
                    value={stats.daysPresent}
                    color="text-green-500"
                    icon={<CalendarDays className="w-5 h-5" />}
                />
                <StatBox
                    title="Overtime"
                    value={`₹${stats.overtimeBonus}`}
                    color="text-blue-400"
                    icon={<Clock3 className="w-5 h-5" />}
                />
                <StatBox
                    title="Profit Bonus"
                    value={`₹${stats.profitBonus}`}
                    color="text-emerald-400"
                    icon={<Trophy className="w-5 h-5" />}
                />
                <StatBox
                    title="Advances"
                    value={`₹${stats.advanceTotal}`}
                    color="text-red-500"
                    icon={<TrendingDown className="w-5 h-5" />}
                />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <h2 className="text-xl font-semibold mb-5">Advance Requests</h2>
                <div className="space-y-3">
                    {advanceRequests.map((item) => (
                        <div key={item.id} className="bg-zinc-800 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">₹{item.amount}</p>
                                    <p className="text-zinc-500 text-sm mt-1">{item.reason}</p>
                                </div>
                                <div>
                                    {item.status === "pending" && (
                                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full">
                                            Pending
                                        </span>
                                    )}
                                    {item.status === "approved" && (
                                        <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">
                                            Approved
                                        </span>
                                    )}
                                    {item.status === "rejected" && (
                                        <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full">
                                            Rejected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {advanceRequests.length === 0 && (
                        <div className="text-center text-zinc-500 py-6">No advance requests</div>
                    )}
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <h2 className="text-xl font-semibold mb-5">Attendance History</h2>
                <div className="space-y-3">
                    {attendance.map((item) => (
                        <div key={item.id} className="bg-zinc-800 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{format(new Date(item.date), "dd MMM yyyy")}</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {item.check_in
                                            ? new Date(item.check_in).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "--"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-500 font-semibold">+₹{item.allowance_earned || 0}</p>
                                    {item.overtime_bonus > 0 && (
                                        <p className="text-blue-400 text-xs mt-1">OT +₹{item.overtime_bonus}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showAdvanceModal && (
                <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end">
                    <div className="bg-zinc-900 rounded-t-3xl p-6 pb-32 w-full border-t border-zinc-800 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-5">Request Advance</h2>
                        <div className="space-y-4">
                            <input
                                type="number"
                                placeholder="Amount"
                                value={advanceAmount}
                                onChange={(e) => setAdvanceAmount(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-white"
                            />
                            <textarea
                                placeholder="Reason"
                                value={advanceReason}
                                onChange={(e) => setAdvanceReason(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 h-28 text-white"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowAdvanceModal(false)}
                                    className="bg-zinc-800 rounded-2xl py-4 text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdvanceRequest}
                                    disabled={advanceLoading}
                                    className="bg-yellow-500 text-black font-semibold rounded-2xl py-4"
                                >
                                    {advanceLoading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ label, value, color, bold }: any) {
    return (
        <div className="flex items-center justify-between">
            <p className={`${bold ? "text-white font-semibold" : "text-zinc-400"}`}>{label}</p>
            <p className={`font-semibold ${color}`}>{value}</p>
        </div>
    );
}

function StatBox({ title, value, color, icon }: any) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-zinc-400 text-sm">{title}</p>
                <div className={color}>{icon}</div>
            </div>
            <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>
        </div>
    );
}