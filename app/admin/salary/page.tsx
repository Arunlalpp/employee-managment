"use client";

import { useState } from "react";

import {
    addMonths,
    format,
    parseISO,
    subMonths,
} from "date-fns";

import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    Loader2,
    TrendingDown,
    IndianRupee,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { useSalary } from "@/lib/hooks/use-salary";
import { useAddAdvance }
    from "@/lib/hooks/use-advance-mutations";

export default function AdminSalaryPage() {

    const [
        selectedMonth,
        setSelectedMonth,
    ] =
        useState(
            new Date()
                .toISOString()
                .slice(0, 7)
        );

    const [
        expandedStaff,
        setExpandedStaff,
    ] =
        useState<string | null>(
            null
        );

    const [
        showAdvanceModal,
        setShowAdvanceModal,
    ] =
        useState<string | null>(
            null
        );

    const [
        advanceForm,
        setAdvanceForm,
    ] =
        useState({
            amount: "",
            reason: "",
        });

    const [
        savingAdvance,
        setSavingAdvance,
    ] =
        useState(false);

    const addAdvanceMutation =
        useAddAdvance();

    // OPTIMIZED QUERY
    const {
        data,
        isLoading,
        error,
    } =
        useSalary(
            selectedMonth
        );

    const salaryData =
        data?.salaryData || [];

    const totalPayroll =
        data?.totalPayroll || 0;

    // MONTH NAVIGATION
    const prevMonth =
        format(
            subMonths(
                parseISO(
                    `${selectedMonth}-01`
                ),
                1
            ),
            "yyyy-MM"
        );

    const nextMonth =
        format(
            addMonths(
                parseISO(
                    `${selectedMonth}-01`
                ),
                1
            ),
            "yyyy-MM"
        );

    const formatCurrency = (
        value: number
    ) =>
        `₹${value.toLocaleString()}`;

    const getMonthLabel = (
        month: string
    ) =>
        format(
            parseISO(
                `${month}-01`
            ),
            "MMMM yyyy"
        );

    const handleAddAdvance =
        async () => {

            if (
                !showAdvanceModal ||
                !advanceForm.amount
            ) {
                return;
            }

            setSavingAdvance(
                true
            );

            try {

                await addAdvanceMutation.mutateAsync(
                    {
                        staffId:
                            showAdvanceModal,

                        amount:
                            advanceForm.amount,

                        reason:
                            advanceForm.reason,
                    }
                );
                setShowAdvanceModal(
                    null
                );
                setAdvanceForm({
                    amount: "",
                    reason: "",
                });
                toast.success(
                    "Advance added"
                );

            } catch (
            error: any
            ) {

                console.error(
                    error
                );

                toast.error(
                    error?.message ||
                        "Failed to add advance"
                );

            } finally {

                setSavingAdvance(
                    false
                );
            }
        };

    // LOADING
    if (isLoading) {

        return (
            <main className="min-h-screen bg-black text-white p-4">

                <div className="space-y-4 animate-pulse">

                    <div className="h-10 w-40 bg-zinc-800 rounded-xl" />

                    <div className="h-28 bg-zinc-900 rounded-2xl" />

                    <div className="h-24 bg-zinc-900 rounded-2xl" />

                    <div className="h-24 bg-zinc-900 rounded-2xl" />

                </div>

            </main>
        );
    }

    // ERROR
    if (error) {

        return (
            <main className="min-h-screen bg-black text-white p-4">

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">

                    <h2 className="text-red-400 font-semibold">
                        Failed to load salary data
                    </h2>

                </div>

            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white p-4">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-3xl font-bold">Salary</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">{salaryData.length} staff members</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-yellow-400" />
                </div>
            </div>

            {/* MONTH SWITCH */}
            <div className="flex items-center gap-2 mb-5">
                <button
                    onClick={() => setSelectedMonth(prevMonth)}
                    className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <p className="font-semibold">{getMonthLabel(selectedMonth)}</p>
                </div>
                <button
                    onClick={() => setSelectedMonth(nextMonth)}
                    className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* PAYROLL CARD */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-900/50 via-zinc-900 to-zinc-900 border border-yellow-500/20 p-6 mb-5">
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
                <p className="text-yellow-500/80 text-xs uppercase tracking-widest font-semibold mb-1">
                    Total Payroll
                </p>
                <h1 className="text-4xl font-light text-yellow-400">
                    {formatCurrency(totalPayroll)}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Net salary after all deductions</p>
            </div>

            {/* STAFF LIST */}
            <div className="space-y-3">

                {salaryData.map(
                    (
                        staff: any
                    ) => {

                        const isExpanded =
                            expandedStaff ===
                            staff.id;

                        const staffAdvances =
                            staff.advances || [];

                        return (

                            <div
                                key={staff.id}
                                className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800"
                            >
                                {/* HEADER */}
                                <button
                                    onClick={() => setExpandedStaff(isExpanded ? null : staff.id)}
                                    className="w-full p-4 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-2xl bg-yellow-500/15 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                                            {staff?.name?.trim().charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <h2 className="font-semibold truncate">{staff.name}</h2>
                                            <p className="text-zinc-500 text-xs">
                                                {staff.daysPresent} days · ₹{staff.allowance} allowance
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <h2 className="font-bold text-yellow-400">
                                                {formatCurrency(staff.netSalary)}
                                            </h2>
                                            <p className="text-zinc-600 text-xs">net pay</p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                    </div>
                                </button>

                                {/* EXPANDED */}
                                {isExpanded && (

                                    <div className="border-t border-zinc-800 p-4">

                                        <SalaryRow
                                            label="Base Salary"
                                            value={formatCurrency(
                                                staff.salary
                                            )}
                                        />

                                        <SalaryRow
                                            label={`Allowance (${staff.daysPresent} × ₹40)`}
                                            value={`+${formatCurrency(
                                                staff.allowance
                                            )}`}
                                            color="text-green-400"
                                        />

                                        {staffAdvances.map(
                                            (
                                                adv: any
                                            ) => (

                                                <SalaryRow
                                                    key={
                                                        adv.id
                                                    }
                                                    label={`Advance: ${adv.reason}`}
                                                    value={`-${formatCurrency(
                                                        adv.amount
                                                    )}`}
                                                    color="text-red-400"
                                                />

                                            )
                                        )}

                                        <div className="border-t border-zinc-800 my-3" />

                                        <SalaryRow
                                            label="Net Salary"
                                            value={formatCurrency(
                                                staff.netSalary
                                            )}
                                            color="text-yellow-400"
                                            bold
                                        />

                                        <button
                                            onClick={() => setShowAdvanceModal(staff.id)}
                                            className="mt-4 w-full bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-red-500/15 active:scale-[0.98] transition-all"
                                        >

                                            <TrendingDown className="w-4 h-4" />

                                            Add Advance

                                        </button>

                                    </div>

                                )}

                            </div>
                        );
                    }
                )}

            </div>

            {/* MODAL */}
            {showAdvanceModal && (

                <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end justify-center pb-24">

                    <div className="w-full max-w-md rounded-t-[32px] bg-zinc-900 border border-zinc-800 p-5 animate-in slide-in-from-bottom duration-300 mb-20">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-5">

                            <h2 className="text-2xl font-bold text-white">
                                Add Advance
                            </h2>

                            <button
                                onClick={() =>
                                    setShowAdvanceModal(
                                        null
                                    )
                                }
                                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"
                            >

                                <X className="w-5 h-5 text-white" />

                            </button>

                        </div>

                        {/* FORM */}
                        <div className="space-y-4">

                            <div>

                                <label className="text-sm text-zinc-400">
                                    Amount
                                </label>

                                <div className="relative mt-2">

                                    <IndianRupee className="absolute left-4 top-4 w-4 h-4 text-zinc-500" />

                                    <input
                                        type="number"
                                        value={
                                            advanceForm.amount
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setAdvanceForm(
                                                {
                                                    ...advanceForm,

                                                    amount:
                                                        e
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                        className="w-full bg-black border border-zinc-700 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:border-yellow-500"
                                        placeholder="Enter amount"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="text-sm text-zinc-400">
                                    Reason
                                </label>

                                <textarea
                                    value={
                                        advanceForm.reason
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setAdvanceForm(
                                            {
                                                ...advanceForm,

                                                reason:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                    className="w-full h-28 bg-black border border-zinc-700 rounded-2xl px-4 py-4 text-white outline-none focus:border-yellow-500 mt-2 resize-none"
                                    placeholder="Advance reason"
                                />

                            </div>

                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-3 mt-6">

                            <button
                                onClick={() =>
                                    setShowAdvanceModal(
                                        null
                                    )
                                }
                                className="flex-1 border border-zinc-700 rounded-2xl py-4 text-white font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleAddAdvance
                                }
                                disabled={
                                    savingAdvance
                                }
                                className="flex-1 bg-yellow-500 text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 active:scale-95 transition"
                            >

                                {savingAdvance ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}

                                Save

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}

function SalaryRow({
    label,
    value,
    color = "text-white",
    bold,
}: any) {

    return (
        <div className="flex items-center justify-between py-2">

            <p className="text-zinc-400 text-sm">
                {label}
            </p>

            <p
                className={`${color} ${bold
                        ? "font-bold"
                        : "font-medium"
                    }`}
            >
                {value}
            </p>

        </div>
    );
}
