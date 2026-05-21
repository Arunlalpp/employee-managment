import StaffNav from "@/components/layout/StaffNav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-base">
      <main className="pb-28">{children}</main>
      <StaffNav />
    </div>
  );
}
