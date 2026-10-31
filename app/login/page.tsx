import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login | RevoShop",
  description: "Sign in to your RevoShop account.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-12">
      <div className="w-full space-y-6">
        <LoginForm />

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
