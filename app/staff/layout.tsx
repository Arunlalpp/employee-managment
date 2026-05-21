import Link from "next/link";

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-zinc-100">
            <aside className="w-64 bg-black text-white p-6">
                <h1 className="text-2xl font-bold mb-8">
                    Staff Panel
                </h1>

                <nav className="space-y-4">
                    <Link
                        href="/staff"
                        className="block hover:text-zinc-300"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/staff/attendance"
                        className="block hover:text-zinc-300"
                    >
                        Attendance
                    </Link>

                    <Link
                        href="/staff/salary"
                        className="block hover:text-zinc-300"
                    >
                        Salary
                    </Link>

                    <Link
                        href="/staff/advances"
                        className="block hover:text-zinc-300"
                    >
                        Advances
                    </Link>

                    <Link
                        href="/staff/profile"
                        className="block hover:text-zinc-300"
                    >
                        Profile
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}