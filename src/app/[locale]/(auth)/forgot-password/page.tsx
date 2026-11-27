"use client";

import React, { useState } from "react";
import { Link } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";
import { API_BASE_URL } from "@/config/api";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const t = useTranslations("Auth");
	const locale = useLocale();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, locale }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || t("forgotPasswordError"));
			}

			setSubmitted(true);
		} catch (err: any) {
			setError(err.message || t("forgotPasswordError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-[100vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-[#F6F8F7]">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center font-display text-4xl font-black tracking-tight text-foreground">
					{t("forgotPasswordTitle")}
				</h2>
				<p className="mt-2 text-center text-sm text-muted-foreground">
					{t("forgotPasswordSubtitle")}
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-5 sm:px-10 shadow-elevated rounded-2xl border border-border">
					{submitted ? (
						<div className="text-center space-y-4">
							<div className="bg-status-success-soft border-l-4 border-status-success p-4 rounded-md">
								<p className="text-sm text-status-success">{t("forgotPasswordSent")}</p>
							</div>
							<p className="text-sm text-muted-foreground">{t("forgotPasswordCheckEmail")}</p>
							<Link
								href="/login"
								className="inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
							>
								{t("backToLogin")}
							</Link>
						</div>
					) : (
						<form className="space-y-6" onSubmit={handleSubmit}>
							{error && (
								<div className="bg-status-danger-soft border-l-4 border-status-danger p-4 rounded-md">
									<p className="text-sm text-status-danger">{error}</p>
								</div>
							)}

							<div>
								<label htmlFor="email" className="block text-sm font-medium text-foreground">
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
								<button
									type="submit"
									disabled={loading}
									className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all ${
										loading
											? "bg-brand-400 cursor-not-allowed"
											: "bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
									}`}
								>
									{loading ? t("forgotPasswordLoading") : t("forgotPasswordSubmit")}
								</button>
							</div>

							<div className="text-center">
								<Link
									href="/login"
									className="text-sm font-semibold text-brand-600 hover:text-brand-700"
								>
									{t("backToLogin")}
								</Link>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
