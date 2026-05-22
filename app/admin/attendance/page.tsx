"use client";

import { useCallback, useEffect, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Loader2, Save } from "lucide-react";
import { formatDate, getCurrentDate } from "@/lib/utils";
import { AttendanceRecord, Profile } from "@/types";

interface AttendanceEntry {
  staff_id: string;
  is_present: boolean;
  check_in: string;
  check_out: string;
  allowance_earned: number;
}

export default function AdminAttendance() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/attendance?date=${selectedDate}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load attendance");
      }

      const staffArr: Profile[] = result.staff ?? [];
      const recs: AttendanceRecord[] = result.attendance ?? [];
      const map: Record<string, AttendanceEntry> = {};

      for (const staff of staffArr) {
        const rec = recs.find((r) => r.staff_id === staff.id);
        map[staff.id] = {
          staff_id: staff.id,
          is_present: rec?.is_present ?? false,
          check_in: rec?.check_in?.slice(0, 5) ?? "09:30",
          check_out: rec?.check_out?.slice(0, 5) ?? "22:30",
          allowance_earned: rec?.allowance_earned ?? 0,
        };
      }

      setStaffList(staffArr);
      setAttendance(map);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load attendance";
      setStaffList([]);
      setAttendance({});
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggle = (staffId: string) => {
    setAttendance((prev) => {
      const cur = prev[staffId];
      const isPresent = !cur.is_present;

      return {
        ...prev,
        [staffId]: {
          ...cur,
          is_present: isPresent,
          allowance_earned: isPresent ? 30 : 0,
        },
      };
    });
    setSaved(false);
  };

  const updateTime = (staffId: string, field: "check_in" | "check_out", value: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], [field]: value },
    }));
    setSaved(false);
  };

  const saveAttendance = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          entries: Object.values(attendance),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to save attendance");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save attendance";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((a) => a.is_present).length;
  const isToday = selectedDate === getCurrentDate();

  return (
    <div className="px-4 pt-14 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1
            className="text-2xl font-semibold text-ink-primary"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Attendance
          </h1>
          <p className="text-ink-muted text-xs">
            {presentCount}/{staffList.length} present
          </p>
        </div>
        <button
          onClick={saveAttendance}
          disabled={saving}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            saved ? "bg-success/20 text-success" : "bg-gold"
          }`}
          style={{ color: saved ? undefined : "#080808" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Date picker */}
      <div className="flex items-center justify-between glass rounded-2xl p-3 mb-5">
        <button
          onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate), 1), "yyyy-MM-dd"))}
          className="p-2 text-ink-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-ink-primary font-semibold text-sm">{formatDate(selectedDate)}</p>
          {isToday && <p className="text-gold text-[10px] uppercase tracking-wider">Today</p>}
        </div>
        <button
          onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd"))}
          disabled={isToday}
          className="p-2 text-ink-secondary disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Staff attendance cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {staffList.map((staff) => {
            const entry = attendance[staff.id];
            if (!entry) return null;

            return (
              <div
                key={staff.id}
                className={`rounded-xl p-4 border transition-all ${
                  entry.is_present ? "bg-success/5 border-success/20" : "glass border-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                        entry.is_present ? "bg-success/20 text-success" : "bg-gold/10 text-gold"
                      }`}
                    >
                      {staff.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-ink-primary text-sm font-medium">{staff.name}</p>
                      {entry.is_present && (
                        <p className="text-success text-[10px]">₹30 allowance earned</p>
                      )}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggle(staff.id)}
                    className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                      entry.is_present ? "bg-success" : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${
                        entry.is_present ? "left-7" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {entry.is_present && (
                  <div className="flex gap-3 pt-2 border-t border-success/10">
                    <div className="flex-1">
                      <label className="text-ink-muted text-[10px] uppercase tracking-wider mb-1 block flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Check In
                      </label>
                      <input
                        type="time"
                        value={entry.check_in}
                        onChange={(e) => updateTime(staff.id, "check_in", e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-ink-primary text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-ink-muted text-[10px] uppercase tracking-wider mb-1 block flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Check Out
                      </label>
                      <input
                        type="time"
                        value={entry.check_out}
                        onChange={(e) => updateTime(staff.id, "check_out", e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-ink-primary text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
