"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    addDays,
    format,
    parseISO,
    subDays,
} from "date-fns";
import { toast } from "sonner";

import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Clock,
    Loader2,
    Save,
    Plus,
    XCircle,
} from "lucide-react";

import {
    formatDate,
    getCurrentDate,
} from "@/lib/utils";
import { AttendanceEntry } from "@/lib/hooks/services/attendance.service";
import { useAttendance } from "@/lib/hooks/services/use-attendance";
import { useSaveAttendance } from "@/lib/hooks/use-admin-mutations";
import { useStaff } from "@/lib/hooks/useStaff";
import { useAdvanceRequestsWithProfiles } from "@/lib/hooks/useMonthAdvances";
import { useUpdateAdvanceRequest } from "@/lib/hooks/use-advance-mutations";
import TabNav from "@/components/TabNav";
import GlobalSearchFilter from "@/components/GlobalSearchFilter";
import Link from "next/link";
import { useSearchParams }
    from "next/navigation";

interface SearchFilters {
    employeeName: string;
    status: string;
    startDate: string;
    endDate: string;
}

const DAILY_ALLOWANCE = 40;

export default function AdminAttendanceContent() {
    const searchParams =
        useSearchParams();
    const saveAttendanceMutation =
        useSaveAttendance();
    const updateRequestMutation = useUpdateAdvanceRequest();

    const [activeTab, setActiveTab] = useState(
        searchParams.get("tab") === "staff"
            ? "staff"
            : searchParams.get("tab") === "requests"
                ? "requests"
                : "attendance"
    );
    const { data: staffList = [] } = useStaff({
        enabled:
            activeTab === "staff",
    });
    const { data: requests = [] } = useAdvanceRequestsWithProfiles({
        enabled:
            activeTab === "requests",
    });
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        employeeName: "",
        status: "",
        startDate: "",
        endDate: "",
    });

    const [
        selectedDate,
        setSelectedDate,
    ] =
        useState(
            getCurrentDate()
        );

    const [
        attendance,
        setAttendance,
    ] =
        useState<
            Record<
                string,
                AttendanceEntry
            >
        >({});

    const [
        saving,
        setSaving,
    ] =
        useState(false);

    const [
        saved,
        setSaved,
    ] =
        useState(false);
    const [
        hasChanges,
        setHasChanges,
    ] =
        useState(false);

    const {
        staffList: attendanceStaffList,
        attendanceMap,
        isLoading,
        error,
    } =
        useAttendance(
            selectedDate,
            {
                enabled:
                    activeTab ===
                    "attendance",
            }
        );

    useEffect(() => {

        if (
            !hasChanges
        ) {
            setAttendance(
                attendanceMap
            );
        }

    }, [attendanceMap, hasChanges]);

    useEffect(() => {

        setHasChanges(
            false
        );

    }, [selectedDate]);

    const setAttendanceStatus = (
        staffId: string,
        isPresent: boolean
    ) => {

        setAttendance(
            (prev) => {

                const cur =
                    prev[
                    staffId
                    ];

                return {
                    ...prev,

                    [staffId]:
                    {
                        ...cur,

                        is_present:
                            isPresent,

                        allowance_earned:
                            isPresent
                                ? DAILY_ALLOWANCE
                                : 0,
                    },
                };
            }
        );

        setSaved(false);
        setHasChanges(true);
    };

    const updateTime = (
        staffId: string,
        field:
            | "check_in"
            | "check_out",
        value: string
    ) => {

        setAttendance(
            (prev) => ({
                ...prev,

                [staffId]:
                {
                    ...prev[
                    staffId
                    ],

                    [field]:
                        value,
                },
            })
        );

        setSaved(false);
        setHasChanges(true);
    };

    const saveAttendance =
        async () => {

            setSaving(true);

            try {

                await saveAttendanceMutation
                    .mutateAsync({
                        date:
                            selectedDate,
                        entries:
                            Object.values(
                                attendance
                            ),
                    });

                setSaved(true);
                setHasChanges(false);

                setTimeout(
                    () =>
                        setSaved(
                            false
                        ),
                    2000
                );

            } catch (
            err
            ) {

                console.error(
                    err
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    const approveRequest = async (item: any) => {
        try {
            await updateRequestMutation.mutateAsync({
                request: item,
                status: "approved",
            });
            toast.success(
                "Advance request approved"
            );
        } catch (error: any) {
            toast.error(
                error?.message ||
                "Failed to approve request"
            );
            console.log(error);
        }
    };

    const rejectRequest = async (id: string) => {
        try {
            await updateRequestMutation.mutateAsync({
                request: { id },
                status: "rejected",
            });
            toast.error(
                "Advance request rejected"
            );
        } catch (error: any) {
            toast.error(
                error?.message ||
                "Failed to reject request"
            );
            console.log(error);
        }
    };

    const presentCount =
        Object.values(
            attendance
        ).filter(
            (a) =>
                a.is_present
        ).length;

    const isToday =
        selectedDate ===
        getCurrentDate();

    const filteredStaffList = attendanceStaffList.filter((staff) => {
        if (searchFilters.employeeName && !staff.name?.toLowerCase().includes(searchFilters.employeeName.toLowerCase())) {
            return false;
        }

        if (searchFilters.status) {
            const entry = attendance[staff.id];
            if (searchFilters.status === "present" && !entry?.is_present) return false;
            if (searchFilters.status === "absent" && entry?.is_present) return false;
        }

        return true;
    });

    const filteredStaffMembers = staffList.filter((staff) => {
        if (searchFilters.employeeName && !staff.name?.toLowerCase().includes(searchFilters.employeeName.toLowerCase())) {
            return false;
        }
        return true;
    });

    const filteredRequests = requests.filter((request) => {
        if (searchFilters.employeeName && !request?.profile?.name?.toLowerCase().includes(searchFilters.employeeName.toLowerCase())) {
            return false;
        }
        if (searchFilters.status && request.status !== searchFilters.status) {
            return false;
        }
        return true;
    });

    const tabs = [
        { id: "attendance", label: "Attendance" },
        { id: "staff", label: "Staff" },
        { id: "requests", label: "Requests" },
    ];

    return (
        <div className="px-4 pt-14 pb-32">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">

                <div>

                    <h1 className="text-2xl font-semibold text-white">
                        Attendance
                    </h1>

                    <p className="text-zinc-500 text-sm">
                        {activeTab === "attendance" && `${filteredStaffList.filter((s) => attendance[s.id]?.is_present).length}/${filteredStaffList.length} present`}
                        {activeTab === "staff" && `${filteredStaffMembers.length} staff members`}
                        {activeTab === "requests" && `${filteredRequests.length} requests`}
                    </p>

                </div>

                {activeTab === "attendance" && saved && (
                    <div className="px-3 py-2 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium">
                        Saved
                    </div>
                )}

            </div>

            {/* TAB NAVIGATION */}
            <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* ATTENDANCE TAB */}
            {activeTab === "attendance" && (
                <>
                    <GlobalSearchFilter onFilterChange={setSearchFilters} />

                    {/* DATE */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between mb-5">

                        <button
                            onClick={() =>
                                setSelectedDate(
                                    format(
                                        subDays(
                                            parseISO(
                                                selectedDate
                                            ),
                                            1
                                        ),
                                        "yyyy-MM-dd"
                                    )
                                )
                            }
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>

                        <div className="text-center">

                            <p className="text-white font-medium">
                                {formatDate(
                                    selectedDate
                                )}
                            </p>

                            {isToday && (
                                <p className="text-yellow-400 text-xs">
                                    TODAY
                                </p>
                            )}

                        </div>

                        <button
                            disabled={
                                isToday
                            }
                            onClick={() =>
                                setSelectedDate(
                                    format(
                                        addDays(
                                            parseISO(
                                                selectedDate
                                            ),
                                            1
                                        ),
                                        "yyyy-MM-dd"
                                    )
                                )
                            }
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>

                    </div>

                    {/* LOADING */}
                    {isLoading ? (

                        <div className="text-center text-zinc-500 py-20">
                            Loading...
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {filteredStaffList.map(
                                (
                                    staff
                                ) => {

                                    const entry =
                                        attendance[
                                        staff.id
                                        ];

                                    if (
                                        !entry
                                    ) {
                                        return null;
                                    }

                                    return (

                                        <div
                                            key={
                                                staff.id
                                            }
                                            className={`rounded-2xl border p-4 transition-all ${entry.is_present
                                                ? "bg-green-500/5 border-green-500/20"
                                                : "bg-zinc-900 border-zinc-800"
                                                }`}
                                        >

                                            <div className="flex items-center justify-between mb-3">

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${entry.is_present
                                                            ? "bg-green-500/20 text-green-400"
                                                            : "bg-yellow-500/20 text-yellow-400"
                                                            }`}
                                                    >
                                                        {staff?.name
                                                            ? staff.name
                                                                .trim()
                                                                .charAt(0)
                                                                .toUpperCase()
                                                            : "?"}
                                                    </div>

                                                    <div>

                                                        <p className="text-white font-medium">
                                                            {staff.name ||
                                                                "Unknown"}
                                                        </p>

                                                        {entry.is_present && (
                                                            <p className="text-green-400 text-xs">
                                                                ₹{DAILY_ALLOWANCE} allowance earned
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                                {/* STATUS */}
                                                <div className="grid grid-cols-2 w-40 rounded-xl bg-black border border-zinc-800 p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setAttendanceStatus(
                                                                staff.id,
                                                                true
                                                            )
                                                        }
                                                        aria-pressed={
                                                            entry.is_present
                                                        }
                                                        className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${entry.is_present
                                                            ? "bg-green-500 text-black"
                                                            : "text-zinc-500"
                                                            }`}
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Present
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setAttendanceStatus(
                                                                staff.id,
                                                                false
                                                            )
                                                        }
                                                        aria-pressed={
                                                            !entry.is_present
                                                        }
                                                        className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${!entry.is_present
                                                            ? "bg-zinc-700 text-white"
                                                            : "text-zinc-500"
                                                            }`}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Absent
                                                    </button>
                                                </div>

                                            </div>

                                            {entry.is_present && (

                                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">

                                                    <div>

                                                        <label className="text-zinc-500 text-xs flex items-center gap-1 mb-1">
                                                            <Clock className="w-3 h-3" />
                                                            Check In
                                                        </label>

                                                        <input
                                                            type="time"
                                                            value={
                                                                entry.check_in
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateTime(
                                                                    staff.id,
                                                                    "check_in",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white"
                                                        />

                                                    </div>

                                                    <div>

                                                        <label className="text-zinc-500 text-xs flex items-center gap-1 mb-1">
                                                            <Clock className="w-3 h-3" />
                                                            Check Out
                                                        </label>

                                                        <input
                                                            type="time"
                                                            value={
                                                                entry.check_out
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateTime(
                                                                    staff.id,
                                                                    "check_out",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white"
                                                        />

                                                    </div>

                                                </div>

                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                    {error && (
                        <div className="mt-5 text-red-400 text-sm">
                            Error loading attendance
                        </div>
                    )}

                    {hasChanges && (
                        <div className="fixed left-4 right-4 bottom-24 z-20 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur md:left-auto md:right-6 md:w-96">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-white font-semibold">
                                        Unsaved changes
                                    </p>

                                    <p className="text-zinc-500 text-xs">
                                        Save after editing attendance or times.
                                    </p>
                                </div>

                                <button
                                    onClick={
                                        saveAttendance
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="h-11 px-4 rounded-xl bg-yellow-500 text-black font-semibold flex items-center gap-2 disabled:opacity-70"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}

                                    {saving
                                        ? "Saving"
                                        : "Save"}
                                </button>
                            </div>
                        </div>
                    )}

                </>
            )}

            {/* STAFF TAB */}
            {activeTab === "staff" && (
                <>
                    <GlobalSearchFilter onFilterChange={setSearchFilters} />

                    {filteredStaffMembers.length === 0 ? (
                        <div className="text-center text-zinc-400 py-12">
                            No staff members found
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredStaffMembers.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                                            {staff.name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{staff.name}</h3>
                                            <p className="text-zinc-400 text-sm">{staff.email}</p>
                                        </div>
                                    </div>
                                    <p className="text-yellow-400 font-semibold">₹{staff.salary}</p>
                                    <Link
                                        href={`/admin/staff/${staff.id}?from=attendance-staff`}
                                        className="mt-3 block text-center bg-yellow-500/10 text-yellow-400 py-2 rounded hover:bg-yellow-500/20 transition"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    <Link
                        href="/admin/staff/add?from=attendance-staff"
                        className="fixed right-5 bottom-24 z-20 h-14 rounded-full bg-yellow-500 text-black shadow-2xl flex items-center justify-center gap-2 px-5 font-semibold hover:bg-yellow-400 transition"
                        aria-label="Add staff"
                    >
                        <Plus className="w-6 h-6" />
                        Add Staff
                    </Link>
                </>
            )}

            {/* REQUESTS TAB */}
            {activeTab === "requests" && (
                <>
                    <GlobalSearchFilter onFilterChange={setSearchFilters} />

                    <div className="space-y-4">
                        {filteredRequests.map((item) => (
                            <div
                                key={item.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
                            >
                                {/* HEADER */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            {item?.profile?.name}
                                        </h2>

                                        <p className="text-zinc-500 text-sm">
                                            {item?.profile?.email}
                                        </p>
                                    </div>

                                    <div>
                                        {item.status === "pending" && (
                                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
                                                Pending
                                            </span>
                                        )}

                                        {item.status === "approved" && (
                                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                                                Approved
                                            </span>
                                        )}

                                        {item.status === "rejected" && (
                                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs">
                                                Rejected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* BODY */}
                                <div className="mt-5">
                                    <p className="text-4xl font-light text-yellow-400">
                                        ₹{item.amount}
                                    </p>

                                    <p className="text-zinc-400 mt-3">
                                        {item.reason}
                                    </p>
                                </div>

                                {/* BUTTONS */}
                                {item.status === "pending" && (
                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        <button
                                            onClick={() => rejectRequest(item.id)}
                                            className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl py-4"
                                        >
                                            Reject
                                        </button>

                                        <button
                                            onClick={() => approveRequest(item)}
                                            className="bg-green-500 text-black font-semibold rounded-2xl py-4"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredRequests.length === 0 && (
                            <div className="text-center text-zinc-500 py-20">
                                No requests found
                            </div>
                        )}
                    </div>
                </>
            )}

        </div>
    );
}
