import AdminNav from "@/components/layout/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-base">
      <main className="pb-28">{children}</main>
      <AdminNav />
    </div>
  );
}
