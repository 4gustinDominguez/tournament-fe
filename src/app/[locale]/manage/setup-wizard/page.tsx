"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ListChecks, ArrowLeft, Loader2 } from "lucide-react";

type WizardMode = "select" | "random" | "guided";

const defaultFormDates = (() => {
  const today = new Date();
  const end = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    startDate: today.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
})();

export default function SetupWizardPage() {
  const t = useTranslations("Wizard");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { generateScenario } = useTournamentContext();

  const [mode, setMode] = useState<WizardMode>("select");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tournamentName: "",
    startDate: defaultFormDates.startDate,
    endDate: defaultFormDates.endDate,
    teamsCount: 8,
    playersPerTeam: 12,
    placesCount: 2,
    refereesCount: 2,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || type === "range" ? parseInt(value) || 0 : value,
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateScenario({
        ...formData,
        mode,
      });
      notify.success(t("success"));
      router.push(`/t/${result.tournament.slug ?? result.tournamentId}`);
    } catch (err) {
      console.error("Generation error:", err);
      notify.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  const maxStep = mode === "random" ? 3 : 2;

  // Mode selection screen
  if (mode === "select") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/manage/my-tournaments")}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToTournaments")}
        </Button>

        <h1 className="display-title text-3xl text-foreground mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{t("subtitle")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quick Random Card */}
          <button
            onClick={() => setMode("random")}
            className="group text-left rounded-xl border-2 border-border bg-white p-6 hover:border-brand-400 hover:shadow-elevated transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-1">
              {t("modeRandomTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("modeRandomDesc")}
            </p>
          </button>

          {/* Guided Card */}
          <button
            onClick={() => setMode("guided")}
            className="group text-left rounded-xl border-2 border-border bg-white p-6 hover:border-brand-400 hover:shadow-elevated transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ListChecks className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-1">
              {t("modeGuidedTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("modeGuidedDesc")}
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            setMode("select");
            setStep(1);
          }
        }}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4" />
        {step > 1 ? t("back") : t("changeMode")}
      </Button>

      {/* Progress bar */}
      <div className="flex h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-brand-500 transition-all duration-500 rounded-full"
          style={{ width: `${(step / maxStep) * 100}%` }}
        />
      </div>

      {/* Step 1: Name & Dates */}
      {step === 1 && (
        <Card className="shadow-elevated border-border rounded-2xl">
          <CardContent className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t("tournamentName")}
              </label>
              <input
                type="text"
                name="tournamentName"
                value={formData.tournamentName}
                onChange={handleChange}
                placeholder={t("tournamentNamePlaceholder")}
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-brand-500 outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t("startDate")}
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  max={formData.endDate}
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t("endDate")}
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Teams config (both modes) */}
      {step === 2 && mode === "guided" && (
        <Card className="shadow-elevated border-border rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">
                  {t("teamsCount")}
                </label>
                <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded-lg text-xs font-bold">
                  {formData.teamsCount}
                </span>
              </div>
              <input
                type="range"
                name="teamsCount"
                min="2"
                max="20"
                step="2"
                value={formData.teamsCount}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>2</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-700">
              <p className="font-bold mb-1">{t("guidedSummaryTitle")}</p>
              <ul className="space-y-1 text-xs">
                <li>✓ {t("liTeamsOnly", { count: formData.teamsCount })}</li>
                <li>✓ {t("liNoPlayers")}</li>
                <li>✓ {t("liNoFixtures")}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 (random): Full config */}
      {step === 2 && mode === "random" && (
        <Card className="shadow-elevated border-border rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">
                  {t("teamsCount")}
                </label>
                <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded-lg text-xs font-bold">
                  {formData.teamsCount}
                </span>
              </div>
              <input
                type="range"
                name="teamsCount"
                min="2"
                max="20"
                step="2"
                value={formData.teamsCount}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>2</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t("places")}
                </label>
                <input
                  type="number"
                  name="placesCount"
                  value={formData.placesCount}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-gray-100 rounded-xl focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t("referees")}
                </label>
                <input
                  type="number"
                  name="refereesCount"
                  value={formData.refereesCount}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-gray-100 rounded-xl focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t("playersPerTeam")}
              </label>
              <div className="flex gap-2">
                {[5, 7, 11, 15].map((val) => (
                  <button
                    key={val}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        playersPerTeam: val,
                      }))
                    }
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      formData.playersPerTeam === val
                        ? "bg-brand-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 (random) / Step 2 final (guided): Summary */}
      {((mode === "random" && step === 3) ||
        (mode === "guided" && step === 2)) &&
        step === maxStep && (
          <Card className="shadow-elevated border-border rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">
                {mode === "random" ? "\u2728" : "\uD83D\uDCCB"}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{t("ready")}</h3>
              <p className="text-gray-500 text-sm mt-2">
                {mode === "random"
                  ? t.rich("summary", {
                      teams: formData.teamsCount,
                      places: formData.placesCount,
                      b: (chunks) => <b>{chunks}</b>,
                    })
                  : t("guidedSummary", {
                      count: formData.teamsCount,
                      name: formData.tournamentName,
                    })}
              </p>

              <div className="mt-8 p-4 bg-brand-50 rounded-2xl border border-brand-100 text-left">
                <h4 className="text-xs font-black text-brand-800 uppercase mb-2">
                  {t("summaryTitle")}
                </h4>
                <ul className="text-xs text-brand-700 space-y-1">
                  {mode === "random" ? (
                    <>
                      <li>
                        ✓{" "}
                        {t("liTeams", { count: formData.teamsCount })}
                      </li>
                      <li>
                        ✓{" "}
                        {t("liPlayers", {
                          count:
                            formData.teamsCount * formData.playersPerTeam,
                        })}
                      </li>
                      <li>✓ {t("liPlaces")}</li>
                      <li>✓ {t("liSchedule")}</li>
                    </>
                  ) : (
                    <>
                      <li>
                        ✓{" "}
                        {t("liTeamsOnly", {
                          count: formData.teamsCount,
                        })}
                      </li>
                      <li>✓ {t("liNoPlayers")}</li>
                      <li>✓ {t("liNoFixtures")}</li>
                    </>
                  )}
                </ul>
              </div>

              {mode === "random" && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left">
                  <h4 className="text-xs font-black text-amber-800 uppercase mb-1">
                    {t("randomPurposeTitle")}
                  </h4>
                  <p className="text-xs text-amber-700">
                    {t("randomPurposeBody")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6">
        {step < maxStep && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !formData.tournamentName}
            className="flex-1 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("next")}
          </Button>
        )}

        {step === maxStep && (
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-card hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("generating")}
              </span>
            ) : (
              t("generateNow")
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
