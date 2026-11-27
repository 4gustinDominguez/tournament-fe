"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { API_BASE_URL } from "@/config/api";

type VerifyStatus = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
	const [status, setStatus] = useState<VerifyStatus>("verifying");
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const t = useTranslations("Auth");
	// React StrictMode re-runs effects in dev; only fire the request once
	const startedRef = useRef(false);

	useEffect(() => {
		if (!token || startedRef.current) {
			return;
		}
		startedRef.current = true;

		const verify = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.message || t("verifyEmailError"));
				}

				setStatus("success");
			} catch (err: any) {
				setError(err.message || t("verifyEmailError"));
				setStatus("error");
			}
		};

		verify();
	}, [token, t]);

	if (!token) {
		return (
			<div className="min-h-[100vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-[#F6F8F7]">
				<div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
					<h2 className="mt-6 font-display text-4xl font-black tracking-tight text-foreground">
						{t("verifyEmailInvalid")}
					</h2>
					<p className="mt-4 text-sm text-muted-foreground">{t("verifyEmailInvalidDesc")}</p>
					<Link
						href="/login"
						className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
					>
						{t("backToLogin")}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[100vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-[#F6F8F7]">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center font-display text-4xl font-black tracking-tight text-foreground">
					{t("verifyEmailTitle")}
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-5 sm:px-10 shadow-elevated rounded-2xl border border-border text-center space-y-4">
					{status === "verifying" && (
						<p className="text-sm text-muted-foreground">{t("verifyEmailVerifying")}</p>
					)}

					{status === "success" && (
						<>
							<div className="bg-status-success-soft border-l-4 border-status-success p-4 rounded-md">
								<p className="text-sm text-status-success">{t("verifyEmailSuccess")}</p>
							</div>
							<p className="text-sm text-muted-foreground">{t("verifyEmailSuccessDesc")}</p>
							<Link
								href="/login"
								className="inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
							>
								{t("backToLogin")}
							</Link>
						</>
					)}

					{status === "error" && (
						<>
							<div className="bg-status-danger-soft border-l-4 border-status-danger p-4 rounded-md">
								<p className="text-sm text-status-danger">{error}</p>
							</div>
							<Link
								href="/login"
								className="inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
							>
								{t("backToLogin")}
							</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
