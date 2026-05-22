import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string): string {
    return format(parseISO(date), "dd MMM yyyy");
}

export function formatTime(time: string | null | undefined): string {
    if (!time) return "—";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
}

export function getCurrentMonth(): string {
    return format(new Date(), "yyyy-MM");
}

export function getCurrentDate(): string {
    return format(new Date(), "yyyy-MM-dd");
}

export function getMonthLabel(month: string): string {
    return format(parseISO(`${month}-01`), "MMMM yyyy");
}

export function getDaysInMonth(month: string): number {
    const [year, m] = month.split("-").map(Number);
    return new Date(year, m, 0).getDate();
}

export function getWorkingDays(month: string): number {
    // All 7 days are working days per requirements
    return getDaysInMonth(month);
}

export const STORE_OPEN_TIME = "09:30";
export const STORE_CLOSE_TIME = "22:30";
export const DAILY_ALLOWANCE = 30;
export const TOTAL_STAFF_SALARY = 14000;
