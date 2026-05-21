"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase";

import {
    TrendingDown,
    CalendarDays,
} from "lucide-react";

import {
    format,
    subMonths,
    addMonths,
    parseISO,
} from "date-fns";

export default function StaffSalary() {
    const [profile, setProfile] =
        useState<any>(null);

    const [selectedMonth, setSelectedMonth] =
        useState(
            format(
                new Date(),
                "yyyy-MM"
            )
        );

    const [attendance, setAttendance] =
        useState<any[]>([]);

    const [advances, setAdvances] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const supabase =
                createClient();

            const {
                data: { user },
            } =
                await supabase.auth.getUser();

            if (!user) return;

            // PROFILE
            const { data: prof } =
                await supabase
                    .from("profiles")
                    .select("*")
                    .eq(
                        "auth_id",
                        user.id
                    )
                    .single();

            if (!prof) return;

            setProfile(prof);

            // MONTH RANGE
            const [y, m] =
                selectedMonth.split(
                    "-"
                );

            const monthStart = `${y}-${m}-01`;

            const monthEnd = `${y}-${m}-${new Date(
                Number(y),
                Number(m),
                0
            ).getDate()}`;

            // ATTENDANCE
            const {
                data: att,
            } =
                await supabase
                    .from(
                        "attendance"
                    )
                    .select("*")
                    .eq(
                        "staff_id",
                        prof.id
                    )
                    .gte(
                        "date",
                        monthStart
                    )
                    .lte(
                        "date",
                        monthEnd
                    )
                    .order(
                        "date",
                        {
                            ascending:
                                false,
                        }
                    );

            // ADVANCES
            const {
                data: adv,
            } =
                await supabase
                    .from(
                        "advances"
                    )
                    .select("*")
                    .eq(
                        "staff_id",
                        prof.id
                    )
                    .gte(
                        "date",
                        monthStart
                    )
                    .lte(
                        "date",
                        monthEnd
                    );

            setAttendance(
                att || []
            );

            setAdvances(
                adv || []
            );
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-white">
                Loading...
            </div>
        );
    }

    // CALCULATIONS
    const daysPresent =
        attendance.filter(
            (a) => a.is_present
        ).length;

    const allowance =
        daysPresent * 30;

    const advanceTotal =
        advances.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.amount
                ),
            0
        );

    const salary =
        Number(
            profile?.salary || 0
        );

    const netSalary =
        salary +
        allowance -
        advanceTotal;

    // MONTH NAVIGATION
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

    const currentMonth =
        format(
            new Date(),
            "yyyy-MM"
        );

    return (
        <div className="px-4 pt-14 pb-32 text-white">
            {/* TITLE */}
            <h1 className="text-3xl font-bold mb-5">
                My Salary
            </h1>

            {/* MONTH NAV */}
            <div className="flex items-center gap-2 mb-5">
                <button
                    onClick={() =>
                        setSelectedMonth(
                            prevMonth
                        )
                    }
                    className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800"
                >
                    ‹
                </button>

                <div className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <p className="font-medium">
                        {format(
                            parseISO(
                                `${selectedMonth}-01`
                            ),
                            "MMMM yyyy"
                        )}
                    </p>
                </div>

                <button
                    disabled={
                        nextMonth >
                        currentMonth
                    }
                    onClick={() =>
                        setSelectedMonth(
                            nextMonth
                        )
                    }
                    className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-30"
                >
                    ›
                </button>
            </div>

            {/* NET SALARY CARD */}
            <div className="rounded-3xl p-5 mb-5 bg-gradient-to-br from-yellow-900/40 to-zinc-900 border border-yellow-500/20">
                <p className="text-yellow-500 text-xs uppercase tracking-widest mb-2">
                    Net Salary
                </p>

                <h2 className="text-5xl font-light text-yellow-400">
                    ₹{netSalary}
                </h2>

                <p className="text-zinc-400 text-sm mt-2">
                    Salary after
                    allowance &
                    deductions
                </p>
            </div>

            {/* BREAKDOWN */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <div className="space-y-4">
                    <Row
                        label="Base Salary"
                        value={`₹${salary}`}
                    />

                    <Row
                        label={`Allowance (${daysPresent} days × ₹30)`}
                        value={`+₹${allowance}`}
                        color="text-green-500"
                    />

                    <Row
                        label="Advance Deduction"
                        value={`-₹${advanceTotal}`}
                        color="text-red-500"
                    />

                    <div className="border-t border-zinc-800 pt-4">
                        <Row
                            label="Net Payable"
                            value={`₹${netSalary}`}
                            color="text-yellow-400"
                            bold
                        />
                    </div>
                </div>
            </div>

            {/* ATTENDANCE */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-5">
                    <CalendarDays className="w-5 h-5 text-yellow-400" />

                    <h2 className="text-lg font-semibold">
                        Attendance
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    <StatBox
                        title="Present"
                        value={daysPresent}
                        color="text-green-500"
                    />

                    <StatBox
                        title="Absent"
                        value={
                            attendance.filter(
                                (
                                    a
                                ) =>
                                    !a.is_present
                            )
                                .length
                        }
                        color="text-red-500"
                    />

                    <StatBox
                        title="Allowance"
                        value={`₹${allowance}`}
                        color="text-yellow-400"
                    />
                </div>

                <div className="space-y-2">
                    {attendance.map(
                        (item) => (
                            <div
                                key={
                                    item.id
                                }
                                className="flex items-center justify-between bg-zinc-800 rounded-2xl p-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {format(
                                            new Date(
                                                item.date
                                            ),
                                            "dd MMM yyyy"
                                        )}
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        {item.check_in
                                            ? new Date(
                                                item.check_in
                                            ).toLocaleTimeString(
                                                [],
                                                {
                                                    hour: "2-digit",
                                                    minute:
                                                        "2-digit",
                                                }
                                            )
                                            : "--"}
                                    </p>
                                </div>

                                <div>
                                    {item.is_present ? (
                                        <span className="text-green-500 text-sm font-semibold">
                                            +₹30
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-sm">
                                            Absent
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    {attendance.length ===
                        0 && (
                            <div className="text-center text-zinc-500 py-5">
                                No records
                            </div>
                        )}
                </div>
            </div>

            {/* ADVANCES */}
            {advances.length >
                0 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingDown className="w-5 h-5 text-red-500" />

                            <h2 className="text-lg font-semibold">
                                Advances
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {advances.map(
                                (
                                    item
                                ) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="flex items-center justify-between bg-zinc-800 rounded-2xl p-4"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {
                                                    item.reason
                                                }
                                            </p>

                                            <p className="text-xs text-zinc-500">
                                                {format(
                                                    new Date(
                                                        item.date
                                                    ),
                                                    "dd MMM yyyy"
                                                )}
                                            </p>
                                        </div>

                                        <p className="text-red-500 font-semibold">
                                            -₹
                                            {
                                                item.amount
                                            }
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

function Row({
    label,
    value,
    color,
    bold,
}: any) {
    return (
        <div className="flex items-center justify-between">
            <p
                className={`${bold
                    ? "text-white font-semibold"
                    : "text-zinc-400"
                    }`}
            >
                {label}
            </p>

            <p
                className={`font-semibold ${color}`}
            >
                {value}
            </p>
        </div>
    );
}

function StatBox({
    title,
    value,
    color,
}: any) {
    return (
        <div className="bg-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-2">
                {title}
            </p>

            <h3
                className={`text-2xl font-bold ${color}`}
            >
                {value}
            </h3>
        </div>
    );
}