"use client";

import React, { useState } from "react";
import { Menu as MenuIcon, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/sections/tournaments/auth-context";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const t = useTranslations("Menu");
  const tDash = useTranslations("Dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-white/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-2 md:px-4 gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar
              className="w-full h-full border-none"
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-1 h-auto rounded-full hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3 pr-2">
                <Avatar className="h-10 w-10 border border-border shadow-sm">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-brand-500 text-white font-display font-bold text-sm">
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start leading-none">
                  <span className="text-sm font-bold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="eyebrow text-[10px] text-muted-foreground mt-1">
                    {user?.role?.replace("_", " ")}
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl mt-1 shadow-elevated border-border"
          >
            <DropdownMenuLabel className="font-bold">
              {tDash("myAccount")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="py-2 cursor-pointer">
              <Link href="/manage/profile" className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{tDash("profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="py-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
