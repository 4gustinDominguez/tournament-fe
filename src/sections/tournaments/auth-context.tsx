"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/config/api";

export enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    TOURNAMENT_ADMIN = "TOURNAMENT_ADMIN",
    REFEREE = "REFEREE",
    PLAYER = "PLAYER",
}

export type UserPlan = 'free' | 'premium';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    plan: UserPlan;
    ownedTournaments: string[];
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<{ user: User; token: string }>;
    logout: () => void;
    updateProfile: (data: {
        firstName?: string;
        lastName?: string;
        currentPassword?: string;
        newPassword?: string;
    }) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Login failed");
        }

        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        return { user: data.user as User, token: data.token as string };
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    }, []);

    const updateProfile = useCallback(async (data: {
        firstName?: string;
        lastName?: string;
        currentPassword?: string;
        newPassword?: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update profile");
        }

        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }, [token]);

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        updateProfile,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
