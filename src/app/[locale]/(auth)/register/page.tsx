"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { API_BASE_URL } from "@/config/api";

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "TOURNAMENT_ADMIN",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || t('registrationError'));
            }

            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.message || t('registrationError'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F6F8F7]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center font-display text-4xl font-black tracking-tight text-foreground">
                    {t('registerSubtitle')}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-5 sm:px-10 shadow-elevated rounded-2xl border border-border">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-status-danger-soft border-l-4 border-status-danger p-4 rounded-md">
                                <p className="text-sm text-status-danger">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground">{t('firstName')}</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground">{t('lastName')}</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">{t('email')}</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">{t('password')}</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">{t('role')}</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm bg-white"
                            >
                                <option value="TOURNAMENT_ADMIN">{t('adminRole')}</option>
                                <option value="REFEREE">{t('refereeRole')}</option>
                                <option value="PLAYER">{t('playerRole')}</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all ${loading
                                    ? "bg-brand-400 cursor-not-allowed"
                                    : "bg-brand-600 hover:bg-brand-700 focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                                    }`}
                            >
                                {loading ? t('loadingRegister') : t('submitRegister')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
