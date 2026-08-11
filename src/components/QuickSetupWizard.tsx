"use client";

import React, { useState } from "react";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";

interface QuickSetupWizardProps {
    onClose: () => void;
}

const defaultFormDates = (() => {
    const today = new Date();
    const end = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
        startDate: today.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
    };
})();

const QuickSetupWizard: React.FC<QuickSetupWizardProps> = ({ onClose }) => {
  const t = useTranslations("Wizard");
  const tCommon = useTranslations("Common");
  const { generateScenario } = useTournamentContext();
  const router = useRouter();

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
      });
      notify.success(t("success"));
      onClose();
      router.push(`/t/${result.tournamentId}`);
    } catch (err) {
      console.error("Generation error:", err);
      notify.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">✨ {t("title")}</h2>
          <p className="text-blue-100 text-sm mt-1">{t("subtitle")}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex h-1 bg-gray-100">
          <div
            className="bg-blue-400 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
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
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-colors"
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
                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
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
                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-700">
                    {t("teamsCount")}
                  </label>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-bold">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                    className="w-full p-2 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
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
                    className="w-full p-2 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
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
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 animate-in slide-in-from-right duration-300">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-xl font-bold text-gray-800">{t("ready")}</h3>
              <p className="text-gray-500 text-sm mt-2">
                {t.rich("summary", {
                  teams: formData.teamsCount,
                  places: formData.placesCount,
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </p>

              <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
                <h4 className="text-xs font-black text-blue-800 uppercase mb-2">
                  {t("summaryTitle")}
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>✓ {t("liTeams", { count: formData.teamsCount })}</li>
                  <li>
                    ✓{" "}
                    {t("liPlayers", {
                      count: formData.teamsCount * formData.playersPerTeam,
                    })}
                  </li>
                  <li>✓ {t("liPlaces")}</li>
                  <li>✓ {t("liSchedule")}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex gap-3">
          {step > 1 && !loading && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-white transition-all"
            >
              {t("back")}
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !formData.tournamentName}
              className={`flex-[2] py-3 px-4 rounded-xl text-white font-bold transition-all ${
                step === 1 && !formData.tournamentName
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              }`}
            >
              {t("next")}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("generating")}</span>
                </div>
              ) : (
                t("generateNow")
              )}
            </button>
          )}

          {!loading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-blue-100 transition-colors"
              title={t("close")}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSetupWizard;
