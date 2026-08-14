"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { Link, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

function defaultRouteForRole(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.TOURNAMENT_ADMIN:
      return "/manage/my-tournaments";
    case UserRole.REFEREE:
      return "/manage/referee";
    case UserRole.PLAYER:
      return "/manage/player";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");

  const requestedRedirect = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedIn = await login(email, password);
      const role = loggedIn?.user?.role ?? user?.role;
      const target = requestedRedirect || (role ? defaultRouteForRole(role) : "/");
      router.push(target);
    } catch (err: any) {
      setError(err.message || t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-[#F6F8F7]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-glow">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9V2M18 9V2M6 9a6 6 0 0 0 12 0M3 9h18M6 14h12a2 2 0 0 1 2 2v5H4v-5a2 2 0 0 1 2-2z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center font-display text-4xl font-black tracking-tight text-foreground">
          {t("loginSubtitle")}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          O{" "}
          <Link
            href={`/register${requestedRedirect ? `?redirect=${encodeURIComponent(requestedRedirect)}` : ""}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("registerLink")}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-elevated rounded-2xl border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-status-danger-soft border-l-4 border-status-danger p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0 text-status-danger">⚠️</div>
                  <div className="ml-3">
                    <p className="text-sm text-status-danger">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                {t("email")}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                title={t("password")}
                className="block text-sm font-medium text-foreground"
              >
                {t("password")}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all ${
                  loading
                    ? "bg-brand-400 cursor-not-allowed"
                    : "bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                }`}
              >
                {loading ? t("loadingLogin") : t("submitLogin")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
