"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

type Attendance = {
    id: string;
    user_id: string;
    date: string;
    check_in: string;
    check_out: string;
    working_hours: string;
};

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<
        Attendance[]
    >([]);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        const { data } = await supabase
            .from("attendance")
            .select("*")
            .order("created_at", {
                ascending: false,
            });

        if (data) {
            setAttendance(data);
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
        >
            <h1 className="text-3xl font-bold mb-6">
                Attendance
            </h1>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-100">
                        <tr>
                            <th className="text-left p-4">
                                User ID
                            </th>
                            <th className="text-left p-4">
                                Date
                            </th>
                            <th className="text-left p-4">
                                Check In
                            </th>
                            <th className="text-left p-4">
                                Check Out
                            </th>
                            <th className="text-left p-4">
                                Hours
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {attendance.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t"
                            >
                                <td className="p-4">
                                    {item.user_id}
                                </td>

                                <td className="p-4">
                                    {item.date}
                                </td>

                                <td className="p-4">
                                    {item.check_in
                                        ? new Date(
                                            item.check_in
                                        ).toLocaleTimeString()
                                        : "-"}
                                </td>

                                <td className="p-4">
                                    {item.check_out
                                        ? new Date(
                                            item.check_out
                                        ).toLocaleTimeString()
                                        : "-"}
                                </td>

                                <td className="p-4">
                                    {
                                        item.working_hours
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.main>
    );
}