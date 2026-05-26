"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/Loading";

interface AuthLayoutProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "staff";
}

export function AuthLayout({ children, requiredRole }: AuthLayoutProps) {
  const router = useRouter();
  const { data: user, isLoading: userLoading, error: userError } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && requiredRole && profile.role !== requiredRole) {
      router.push(profile.role === "admin" ? "/admin/dashboard" : "/staff/dashboard");
    }
  }, [profile, profileLoading, requiredRole, router]);

  if (userLoading || profileLoading || !user || !profile) {
    return <Loading className="min-h-screen" />;
  }

  return <>{children}</>;
}
