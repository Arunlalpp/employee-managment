import Link from "next/link";
import LogoutButton from "@/components/logout-button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            <aside className="w-64 bg-black text-white p-5">
                <h1 className="text-2xl font-bold mb-8">
                    Employee Management
                </h1>
                <nav className="space-y-4">
                    <Link
                        href="/admin"
                        className="block hover:text-zinc-300"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/admin/staff"
                        className="block hover:text-zinc-300"
                    >
                        Staff
                    </Link>
                    <Link href="/admin/staff/add" className="block hover:text-zinc-300">
                        Add Staff
                    </Link>

                    <Link
                        href="/admin/attendance"
                        className="block hover:text-zinc-300"
                    >
                        Attendance
                    </Link>

                    <Link
                        href="/admin/salary"
                        className="block hover:text-zinc-300"
                    >
                        Salary
                    </Link>

                    <Link
                        href="/admin/advances"
                        className="block hover:text-zinc-300"
                    >
                        Advances
                    </Link>

                    <Link
                        href="/admin/deductions"
                        className="block hover:text-zinc-300"
                    >
                        Deductions
                    </Link>
                </nav>
                <LogoutButton />
            </aside>
            <main className="flex-1 bg-zinc-100 p-6">
                {children}
            </main>
        </div>
    );
}