import StaffNav from "@/components/layout/StaffNav";
import IOSInstallBanner from "@/components/IOSInstallBanner";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-base">
      <main className="pb-28">{children}</main>
      <IOSInstallBanner />
      <StaffNav />
    </div>
  );
}
