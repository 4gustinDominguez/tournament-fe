"use client";

import { Player } from "@/modules/tournament/domain/player";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { notify } from "@/lib/notify";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { PhotoUpload } from "@/components/PhotoUpload";

interface EditPlayerFormProps {
  teamId: string;
  tournamentId: string;
  player: Player;
  onSuccess?: () => void;
}

const EditPlayerForm: React.FC<EditPlayerFormProps> = ({
  tournamentId,
  player,
  onSuccess,
}) => {
  const t = useTranslations("EditPlayerForm");
  const { updatePlayer } = useTournamentContext();
  const [loading, setLoading] = useState(false);

  // Initialize form with defaults for nested objects
  const [form, setForm] = useState<Player>({
    ...player,
    socialMedia: player.socialMedia || {},
    statistics: player.statistics || {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
    },
  });

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "height" || name === "weight" || name === "dorsal" ? Number(value) || undefined : value,
    }));
  }

  function handleSocialChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      socialMedia: {
        ...(prev.socialMedia || {}),
        [name]: value,
      },
    }));
  }

  function handleStatsChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      statistics: {
        ...(prev.statistics || {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0,
        }),
        [name]: Number(value),
      },
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!form.name || !form.nickname) {
      notify.warning(t("alertRequired"));
      return;
    }

    setLoading(true);
    try {
      await updatePlayer({
        tournamentId,
        player: form,
      });

      notify.success(t("success"));
      onSuccess?.();
    } catch (error) {
      console.error("Could not update player", error);
      notify.error(error instanceof Error ? error.message : t("alertError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground border-b border-border pb-1">{t("basicInfo")}</h4>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("fullName")}</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("namePlaceholder")}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("nickname")}</label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder={t("nicknamePlaceholder")}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("dorsal")}</label>
              <input
                type="number"
                name="dorsal"
                value={form.dorsal ?? ""}
                onChange={handleChange}
                placeholder="10"
                min="0"
                max="99"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("position")}</label>
              <select
                name="position"
                value={form.position || ""}
                onChange={handleChange}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
              >
                <option value="">{t("selectPosition")}</option>
                <option value="Goalkeeper">{t("goalkeeper")}</option>
                <option value="Defender">{t("defender")}</option>
                <option value="Midfielder">{t("midfielder")}</option>
                <option value="Forward">{t("forward")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical & Media */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground border-b border-border pb-1">{t("physical")}</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("height")}</label>
              <input
                type="number"
                name="height"
                value={form.height || ""}
                onChange={handleChange}
                placeholder="180"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("weight")}</label>
              <input
                type="number"
                name="weight"
                value={form.weight || ""}
                onChange={handleChange}
                placeholder="75"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("photoUrl")}</label>
            <PhotoUpload
              value={form.photoUrl || undefined}
              onChange={(url) => setForm({ ...form, photoUrl: (typeof url === "string" ? url : "") || "" })}
              folder="players"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground border-b border-border pb-1">{t("social")}</h4>

          <div className="space-y-3">
            <input
              type="text"
              name="instagram"
              value={form.socialMedia?.instagram || ""}
              onChange={handleSocialChange}
              placeholder={t("instagramPlaceholder")}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
            />
            <input
              type="text"
              name="twitter"
              value={form.socialMedia?.twitter || ""}
              onChange={handleSocialChange}
              placeholder={t("twitterPlaceholder")}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground border-b border-border pb-1">{t("quickStats")}</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase">{t("goals")}</label>
              <input
                type="number"
                name="goals"
                value={form.statistics?.goals ?? 0}
                onChange={handleStatsChange}
                className="w-full border border-input rounded-lg px-2 py-1 text-sm text-center bg-white text-foreground"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase">{t("assists")}</label>
              <input
                type="number"
                name="assists"
                value={form.statistics?.assists ?? 0}
                onChange={handleStatsChange}
                className="w-full border border-input rounded-lg px-2 py-1 text-sm text-center bg-white text-foreground"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase">{t("played")}</label>
              <input
                type="number"
                name="matchesPlayed"
                value={form.statistics?.matchesPlayed ?? 0}
                onChange={handleStatsChange}
                className="w-full border border-input rounded-lg px-2 py-1 text-sm text-center bg-white text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl shadow-card transition-all duration-200 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {t("saving")}
            </>
          ) : (
            t("saveChanges")
          )}
        </button>
      </div>
    </form>
  );
};

export default EditPlayerForm;
