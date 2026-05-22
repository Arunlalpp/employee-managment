export type UserRole = "admin" | "staff";

export interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    monthly_salary: number;
    daily_allowance: number; // default 30
    phone?: string;
    joining_date: string;
    is_active: boolean;
    name: string;
    created_at: string;
}

export interface AttendanceRecord {
    id: string;
    staff_id: string;
    date: string; // YYYY-MM-DD
    check_in?: string | null; // HH:MM:SS
    check_out?: string | null; // HH:MM:SS
    is_present: boolean;
    allowance_earned: number; // 30 if present, 0 if absent
    notes?: string;
    created_at: string;
    staff?: Profile;
}

export interface AdvancePayment {
    id: string;
    staff_id: string;
    amount: number;
    reason: string;
    date: string;
    is_deducted: boolean;
    deducted_month?: string; // YYYY-MM
    created_at: string;
    staff?: Profile;
}

export interface MonthlySalarySummary {
    staff_id: string;
    month: string; // YYYY-MM
    staff?: Profile;
    base_salary: number;
    days_present: number;
    total_allowance: number;
    advance_deductions: number;
    net_salary: number;
}

export interface DashboardStats {
    total_staff: number;
    present_today: number;
    absent_today: number;
    monthly_payroll: number;
    pending_advances: number;
}

export interface NavItem {
    label: string;
    href: string;
    icon: string;
}
