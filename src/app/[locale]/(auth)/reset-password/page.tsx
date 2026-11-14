"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { API_BASE_URL } from "@/config/api";

export default function ResetPasswordPage() {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();
	const t = useTranslations("Auth");

	const token = searchParams.get("token");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (newPassword !== confirmPassword) {
			setError(t("resetPasswordMismatch"));

			return;
		}

		if (newPassword.length < 6) {
			setError(t("resetPasswordMinLength"));

			return;
		}

		setLoading(true);

		try {
			const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, newPassword }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || t("resetPasswordError"));
			}

			setSubmitted(true);
		} catch (err: any) {
			setError(err.message || t("resetPasswordError"));
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="min-h-[100vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-[#F6F8F7]">
				<div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
					<h2 className="mt-6 font-display text-4xl font-black tracking-tight text-foreground">
						{t("resetPasswordInvalid")}
					</h2>
					<p className="mt-4 text-sm text-muted-foreground">
						{t("resetPasswordInvalidDesc")}
					</p>
					<Link
						href="/forgot-password"
						className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
					>
						{t("forgotPasswordSubmit")}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[100vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-[#F6F8F7]">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center font-display text-4xl font-black tracking-tight text-foreground">
					{t("resetPasswordTitle")}
				</h2>
				<p className="mt-2 text-center text-sm text-muted-foreground">
					{t("resetPasswordSubtitle")}
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-5 sm:px-10 shadow-elevated rounded-2xl border border-border">
					{submitted ? (
						<div className="text-center space-y-4">
							<div className="bg-status-success-soft border-l-4 border-status-success p-4 rounded-md">
								<p className="text-sm text-status-success">{t("resetPasswordSuccess")}</p>
							</div>
							<button
								onClick={() => router.push("/login")}
								className="text-sm font-semibold text-brand-600 hover:text-brand-700"
							>
								{t("backToLogin")}
							</button>
						</div>
					) : (
						<form className="space-y-6" onSubmit={handleSubmit}>
							{error && (
								<div className="bg-status-danger-soft border-l-4 border-status-danger p-4 rounded-md">
									<p className="text-sm text-status-danger">{error}</p>
								</div>
							)}

							<div>
								<label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
									{t("newPassword")}
								</label>
								<div className="mt-1">
									<input
										id="newPassword"
										name="newPassword"
										type="password"
										required
										minLength={6}
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="appearance-none block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 sm:text-sm"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
									{t("confirmPassword")}
								</label>
								<div className="mt-1">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										required
										minLength={6}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
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
									{loading ? t("resetPasswordLoading") : t("resetPasswordSubmit")}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
