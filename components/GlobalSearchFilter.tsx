"use client";

import { useState } from "react";
import { Search, X, Calendar } from "lucide-react";

interface SearchFilters {
    employeeName: string;
    status: string;
    startDate: string;
    endDate: string;
}

interface GlobalSearchFilterProps {
    onFilterChange: (filters: SearchFilters) => void;
}

export default function GlobalSearchFilter({ onFilterChange }: GlobalSearchFilterProps) {
    const [filters, setFilters] = useState<SearchFilters>({
        employeeName: "",
        status: "",
        startDate: "",
        endDate: "",
    });

    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (field: keyof SearchFilters, value: string) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            employeeName: "",
            status: "",
            startDate: "",
            endDate: "",
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const hasFilters = Object.values(filters).some(v => v !== "");

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition-all"
            >
                <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-zinc-400" />
                    <span className="text-white">
                        {hasFilters ? `${Object.values(filters).filter(v => v).length} Filter${Object.values(filters).filter(v => v).length > 1 ? 's' : ''} Active` : "Search & Filter"}
                    </span>
                </div>
                <span className="text-zinc-500">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
                <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
                    {/* Employee Name */}
                    <div>
                        <label className="text-zinc-400 text-sm block mb-2">Employee Name</label>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={filters.employeeName}
                            onChange={(e) => handleChange("employeeName", e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:border-yellow-500 transition-all"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-zinc-400 text-sm block mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-yellow-500 transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-zinc-400 text-sm block mb-2">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleChange("startDate", e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-yellow-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-zinc-400 text-sm block mb-2">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleChange("endDate", e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-yellow-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Clear Button */}
                    {hasFilters && (
                        <button
                            onClick={handleClear}
                            className="w-full mt-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl px-3 py-2 transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
