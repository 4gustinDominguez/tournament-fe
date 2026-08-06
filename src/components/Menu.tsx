"use client";

import React from "react";
import { Link } from "@/navigation";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";
import { LayoutDashboard, LogOut } from "lucide-react";

interface MenuProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

const Menu = ({ mobile = false, onNavigate }: MenuProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations("Menu");
  const dashboardHref =
    user?.role === UserRole.REFEREE ? "/manage/referee" : "/manage/my-tournaments";

  if (mobile) {
    return (
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
        {isAuthenticated ? (
          <>
            <p className="text-night-100 text-sm">
              {t("greeting", { name: user?.firstName ?? "" })}
            </p>
            <Link
              href={dashboardHref}
              onClick={onNavigate}
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold py-3 px-4 rounded-lg transition-all shadow-glow"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("dashboard")}
            </Link>
            <button
              onClick={() => {
                logout();
                onNavigate?.();
              }}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-colors border border-white/10"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold py-3 px-4 rounded-lg transition-all shadow-glow text-center"
          >
            {t("login")}
          </Link>
        )}
        <LocaleSwitcher />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all shadow-glow hover:scale-105"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard")}
          </Link>
          <span className="text-night-100 text-sm hidden md:block">
            {t("greeting", { name: user?.firstName ?? "" })}
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors border border-white/10"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-all shadow-glow hover:scale-105"
        >
          {t("login")}
        </Link>
      )}
      <LocaleSwitcher />
    </div>
  );
};

export default Menu;
