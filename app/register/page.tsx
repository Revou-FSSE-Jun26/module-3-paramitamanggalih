import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Register | RevoShop",
  description: "Create your RevoShop customer account.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-12">
      <div className="w-full space-y-6">
        <RegisterForm />

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
