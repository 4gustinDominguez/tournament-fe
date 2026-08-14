"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Player } from "@/modules/tournament/domain/player";
import { useTranslations } from "next-intl";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/services/imageService";
import { notify } from "@/lib/notify";

export default function PlayerPage() {
  const t = useTranslations("PlayerPage");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const { getPlayerMe, updatePlayer } = useTournamentContext();

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    nickname: "",
    dorsal: "",
    position: "",
    height: "",
    weight: "",
    photoUrl: "",
    socialMedia: {
      instagram: "",
      twitter: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.PLAYER) {
      setLoading(false);
      return;
    }

    const loadPlayerData = async () => {
      try {
        setLoading(true);
        const playerProfile = await getPlayerMe();

        if (!playerProfile) {
          setError(t("noProfile"));
          setLoading(false);
          return;
        }

        setPlayer(playerProfile);
        setForm({
          nickname: playerProfile.nickname || "",
          dorsal: playerProfile.dorsal?.toString() || "",
          position: playerProfile.position || "",
          height: playerProfile.height?.toString() || "",
          weight: playerProfile.weight?.toString() || "",
          photoUrl: playerProfile.photoUrl || "",
          socialMedia: {
            instagram: playerProfile.socialMedia?.instagram || "",
            twitter: playerProfile.socialMedia?.twitter || "",
          },
        });
      } catch (err) {
        console.error("Error loading player data:", err);
        setError(tCommon("error"));
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [name]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    setSaving(true);
    try {
      const updates: Partial<Player> = {
        nickname: form.nickname,
        dorsal: form.dorsal ? Number(form.dorsal) : undefined,
        position: form.position || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        socialMedia: {
          instagram: form.socialMedia.instagram || undefined,
          twitter: form.socialMedia.twitter || undefined,
        },
        fullRegistered: true,
      };

      const updated = { ...player, ...updates } as Player;
      await updatePlayer({ tournamentId: player.tournaments[0] || "", player: updated });
      setPlayer(updated);
      notify.success(t("saveSuccess"));
    } catch (err) {
      console.error("Error updating player:", err);
      notify.error(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || user?.role !== UserRole.PLAYER) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {t("denyAccess")}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          {tCommon("loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-black text-foreground mb-6">
        {t("title")}
      </h1>

      {player && (
        <div className="bg-white p-4 rounded-xl border border-border shadow-card mb-6">
          <div className="flex items-center gap-4">
            {(previewUrl || player.photoUrl) ? (
              <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={previewUrl || player.photoUrl || ""}
                  alt={player.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-display font-bold text-2xl flex-shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                {t("welcome", { name: player.name })}
              </h2>
              {player.dorsal && (
                <p className="text-muted-foreground text-sm">
                  {t("dorsal")}: {player.dorsal}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              {t("photo")}
            </p>
            <div className="flex items-end gap-4">
              <PhotoUpload
                value={previewUrl || player.photoUrl || undefined}
                onChange={(value) => {
                  if (value instanceof File) {
                    setPendingPhotoFile(value);
                    setPreviewUrl(URL.createObjectURL(value));
                  } else {
                    setPendingPhotoFile(null);
                    setPreviewUrl(null);
                  }
                }}
                folder="players"
                deferUpload
              />
              {pendingPhotoFile && (
                <Button
                  size="sm"
                  onClick={async () => {
                    setSavingPhoto(true);
                    try {
                      const result = await uploadImage(pendingPhotoFile, "players");
                      const updated = { ...player, photoUrl: result.url };
                      await updatePlayer({ tournamentId: player.tournaments[0] || "", player: updated });
                      setPlayer(updated);
                      setPendingPhotoFile(null);
                      setPreviewUrl(null);
                      notify.success(t("photoSaved"));
                    } catch (err) {
                      notify.error(err instanceof Error ? err.message : t("photoError"));
                    } finally {
                      setSavingPhoto(false);
                    }
                  }}
                  disabled={savingPhoto}
                >
                  {savingPhoto ? tCommon("saving") : tCommon("save")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-border shadow-card space-y-6">
        <h3 className="font-display text-lg font-bold text-foreground border-b border-border pb-2">
          {t("editProfile")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("nickname")}</label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("dorsal")}</label>
            <input
              type="number"
              name="dorsal"
              value={form.dorsal}
              onChange={handleChange}
              min="0"
              max="99"
              placeholder="10"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("position")}</label>
            <select
              name="position"
              value={form.position}
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

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t("height")}</label>
            <input
              type="number"
              name="height"
              value={form.height}
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
              value={form.weight}
              onChange={handleChange}
              placeholder="75"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground border-b border-border pb-1">{t("social")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="instagram"
              value={form.socialMedia.instagram}
              onChange={handleSocialChange}
              placeholder={t("instagramPlaceholder")}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
            />
            <input
              type="text"
              name="twitter"
              value={form.socialMedia.twitter}
              onChange={handleSocialChange}
              placeholder={t("twitterPlaceholder")}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl shadow-card transition-all duration-200 flex items-center justify-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {t("saving")}
            </>
          ) : (
            t("saveChanges")
          )}
        </button>
      </form>
    </div>
  );
}
