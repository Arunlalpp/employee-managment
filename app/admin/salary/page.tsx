"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

import {
    ChevronDown,
    X,
    Check,
    Loader2,
    TrendingDown,
    IndianRupee,
} from "lucide-react";

import {
    format,
    subMonths,
    addMonths,
    parseISO,
} from "date-fns";

export default function AdminSalaryPage() {
    const [selectedMonth, setSelectedMonth] =
        useState(
            new Date()
                .toISOString()
                .slice(0, 7)
        );

    const [staffList, setStaffList] =
        useState<any[]>([]);

    const [attendanceMap, setAttendanceMap] =
        useState<any>({});

    const [advancesMap, setAdvancesMap] =
        useState<any>({});

    const [loading, setLoading] =
        useState(true);

    const [expandedStaff, setExpandedStaff] =
        useState<string | null>(null);

    const [
        showAdvanceModal,
        setShowAdvanceModal,
    ] = useState<string | null>(null);

    const [advanceForm, setAdvanceForm] =
        useState({
            amount: "",
            reason: "",
        });

    const [savingAdvance, setSavingAdvance] =
        useState(false);

    // FORMAT CURRENCY
    const formatCurrency = (
        value: number
    ) => {
        return `₹${value.toLocaleString()}`;
    };

    // MONTH LABEL
    const getMonthLabel = (
        month: string
    ) => {
        return format(
            parseISO(`${month}-01`),
            "MMMM yyyy"
        );
    };

    // FETCH DATA
    const fetchData = useCallback(
        async () => {
            setLoading(true);

            const supabase =
                createClient();

            const [y, m] =
                selectedMonth.split("-");

            const startDate = `${y}-${m}-01`;

            const endDate = `${y}-${m}-${new Date(
                Number(y),
                Number(m),
                0
            ).getDate()}`;

            const [
                { data: staff },
                { data: attendance },
                { data: advances },
            ] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("*")
                    .eq("role", "staff")
                    .order("name"),

                supabase
                    .from("attendance")
                    .select("*")
                    .gte(
                        "date",
                        startDate
                    )
                    .lte(
                        "date",
                        endDate
                    ),

                supabase
                    .from("advances")
                    .select("*"),
            ]);

            const staffArr =
                staff || [];

            setStaffList(staffArr);

            const aMap: any = {};
            const advMap: any = {};

            staffArr.forEach(
                (staff: any) => {
                    aMap[staff.id] =
                        (
                            attendance ||
                            []
                        ).filter(
                            (a: any) =>
                                a.staff_id ===
                                staff.id
                        );

                    advMap[staff.id] =
                        (
                            advances ||
                            []
                        ).filter(
                            (a: any) =>
                                a.staff_id ===
                                staff.id
                        );
                }
            );

            setAttendanceMap(aMap);
            setAdvancesMap(advMap);

            setLoading(false);
        },
        [selectedMonth]
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // SUMMARY
    const getSummary = (
        staff: any
    ) => {
        const attendance =
            attendanceMap[
            staff.id
            ] || [];

        const advances =
            advancesMap[
            staff.id
            ] || [];

        const daysPresent =
            attendance.filter(
                (d: any) =>
                    d.is_present
            ).length;

        const allowance =
            daysPresent * 30;

        const advanceDeduction =
            advances.reduce(
                (
                    sum: number,
                    item: any
                ) =>
                    sum +
                    Number(
                        item.amount
                    ),
                0
            );

        const netSalary =
            Number(
                staff.salary || 0
            ) +
            allowance -
            advanceDeduction;

        return {
            daysPresent,
            allowance,
            advanceDeduction,
            netSalary,
        };
    };

    // ADD ADVANCE
    const handleAddAdvance = async () => {
        if (!showAdvanceModal) return;

        try {
            setSavingAdvance(true);

            const supabase = createClient();

            const { error } = await supabase
                .from("advances")
                .insert({
                    staff_id: showAdvanceModal,
                    amount: Number(advanceForm.amount),
                    reason: advanceForm.reason,
                    date: new Date()
                        .toISOString()
                        .split("T")[0],
                });

            if (error) {
                console.log(error);
                alert(error.message);
                return;
            }

            // CLOSE MODAL
            setShowAdvanceModal(null);

            // RESET FORM
            setAdvanceForm({
                amount: "",
                reason: "",
            });

            // REFRESH DATA
            await fetchData();
        } catch (err) {
            console.log(err);
        } finally {
            setSavingAdvance(false);
        }
    };
    const totalPayroll =
        staffList.reduce(
            (
                sum,
                staff
            ) =>
                sum +
                getSummary(staff)
                    .netSalary,
            0
        );

    const prevMonth = format(
        subMonths(
            parseISO(
                `${selectedMonth}-01`
            ),
            1
        ),
        "yyyy-MM"
    );

    const nextMonth = format(
        addMonths(
            parseISO(
                `${selectedMonth}-01`
            ),
            1
        ),
        "yyyy-MM"
    );

    return (
        <main className="min-h-screen bg-black text-white p-4">
            {/* TITLE */}
            <h1 className="text-3xl font-bold mb-4">
                Salary
            </h1>

            {/* MONTH */}
            <div className="flex items-center gap-2 mb-5">
                <button
                    onClick={() =>
                        setSelectedMonth(
                            prevMonth
                        )
                    }
                    className="bg-zinc-900 px-4 py-2 rounded-xl"
                >
                    ‹
                </button>

                <div className="flex-1 bg-zinc-900 py-2 rounded-xl text-center">
                    {getMonthLabel(
                        selectedMonth
                    )}
                </div>

                <button
                    onClick={() =>
                        setSelectedMonth(
                            nextMonth
                        )
                    }
                    className="bg-zinc-900 px-4 py-2 rounded-xl"
                >
                    ›
                </button>
            </div>

            {/* PAYROLL */}
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-2xl p-5 mb-5">
                <p className="text-yellow-500 text-xs uppercase">
                    Total Payroll
                </p>

                <h1 className="text-4xl font-bold text-yellow-400 mt-2">
                    {formatCurrency(
                        totalPayroll
                    )}
                </h1>

                <p className="text-zinc-400 text-sm mt-1">
                    Net salary after
                    deductions
                </p>
            </div>

            {/* STAFF LIST */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map(
                        (_, i) => (
                            <div
                                key={i}
                                className="h-24 rounded-2xl bg-zinc-900 animate-pulse"
                            />
                        )
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {staffList.map(
                        (staff) => {
                            const {
                                daysPresent,
                                allowance,
                                advanceDeduction,
                                netSalary,
                            } =
                                getSummary(
                                    staff
                                );

                            const isExpanded =
                                expandedStaff ===
                                staff.id;

                            const advances =
                                advancesMap[
                                staff.id
                                ] ||
                                [];

                            return (
                                <div
                                    key={
                                        staff.id
                                    }
                                    className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800"
                                >
                                    <button
                                        onClick={() =>
                                            setExpandedStaff(
                                                isExpanded
                                                    ? null
                                                    : staff.id
                                            )
                                        }
                                        className="w-full p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                                                {staff.name.charAt(
                                                    0
                                                )}
                                            </div>

                                            <div className="text-left">
                                                <h2 className="font-semibold">
                                                    {
                                                        staff.name
                                                    }
                                                </h2>

                                                <p className="text-zinc-400 text-xs">
                                                    {
                                                        daysPresent
                                                    }{" "}
                                                    days
                                                    present
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <h2 className="font-bold text-yellow-400">
                                                    {formatCurrency(
                                                        netSalary
                                                    )}
                                                </h2>

                                                <p className="text-zinc-500 text-xs">
                                                    Net
                                                    Pay
                                                </p>
                                            </div>

                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform ${isExpanded
                                                    ? "rotate-180"
                                                    : ""
                                                    }`}
                                            />
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
                                                label={`Allowance (${daysPresent} × ₹30)`}
                                                value={`+${formatCurrency(
                                                    allowance
                                                )}`}
                                                color="text-green-400"
                                            />

                                            {advances.map(
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
                                                    netSalary
                                                )}
                                                color="text-yellow-400"
                                                bold
                                            />

                                            <button
                                                onClick={() =>
                                                    setShowAdvanceModal(
                                                        staff.id
                                                    )
                                                }
                                                className="mt-4 w-full border border-red-500 text-red-400 rounded-xl py-3 flex items-center justify-center gap-2"
                                            >
                                                <TrendingDown className="w-4 h-4" />
                                                Add
                                                Advance
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            )}

            {/* MODAL */}
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
                                    setShowAdvanceModal(null)
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
                                        value={advanceForm.amount}
                                        onChange={(e) =>
                                            setAdvanceForm({
                                                ...advanceForm,
                                                amount: e.target.value,
                                            })
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
                                    value={advanceForm.reason}
                                    onChange={(e) =>
                                        setAdvanceForm({
                                            ...advanceForm,
                                            reason: e.target.value,
                                        })
                                    }
                                    className="w-full h-28 bg-black border border-zinc-700 rounded-2xl px-4 py-4 text-white outline-none focus:border-yellow-500 mt-2 resize-none"
                                    placeholder="Advance reason"
                                />
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setShowAdvanceModal(null)
                                }
                                className="flex-1 border border-zinc-700 rounded-2xl py-4 text-white font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAddAdvance}
                                disabled={savingAdvance}
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

// ROW
function SalaryRow({
    label,
    value,
    color = "text-white",
    bold,
}: {
    label: string;
    value: string;
    color?: string;
    bold?: boolean;
}) {
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