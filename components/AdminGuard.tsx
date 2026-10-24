"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-slate-600">Checking administrator access...</p>
      </section>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-slate-600">Redirecting...</p>
      </section>
    );
  }

  return <>{children}</>;
}
