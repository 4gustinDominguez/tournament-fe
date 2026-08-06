"use client";

import React, { useEffect } from "react";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useRouter } from "@/navigation";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        } else if (!isLoading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.push("/"); // Redirect if role not allowed
        }
    }, [isLoading, isAuthenticated, user, router, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

    return <>{children}</>;
};
