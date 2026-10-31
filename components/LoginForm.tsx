"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth, type AuthUser } from "@/context/AuthContext";

interface ApiUser {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

interface LoginResponse {
  message?: string;
  user?: ApiUser;
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      setError("API URL is not configured.");
      return;
    }

    setIsSubmitting(true);

    try {
      const baseUrl = apiBaseUrl.replace(/\/$/, "");

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      const apiUser = data.user ?? data;

      if (
        typeof apiUser.id !== "number" ||
        !apiUser.name ||
        !apiUser.email
      ) {
        throw new Error("The login response is incomplete.");
      }

      let userRole = apiUser.role;

      // If the login endpoint omits the role, retrieve it from the user endpoint.
      if (!userRole) {
        const userResponse = await fetch(`${baseUrl}/users/${apiUser.id}`);
        if (userResponse.ok) {
          const userData = (await userResponse.json()) as ApiUser;
          userRole = userData.role;
        }
      }

      const user: AuthUser = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: userRole === "admin" ? "admin" : "customer",
      };

      login(user);
      toast.success("Login successful!");

      router.replace(user.role === "admin" ? "/dashboard" : "/");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not connect to the server.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your RevoShop account.
        </p>
      </div>

      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
