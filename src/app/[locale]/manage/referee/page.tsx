"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Referee } from "@/modules/referees/domain/referee";
import { Match } from "@/modules/tournament/domain/match";
import { Team } from "@/modules/tournament/domain/team";
import { Place } from "@/modules/places/domain/place";
import { useTranslations } from "next-intl";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/services/imageService";
import { notify } from "@/lib/notify";
import { PlaceLink } from "@/components/PlaceLink";
import { getPlace } from "@/lib/places";

export default function RefereePage() {
  const t = useTranslations("Referee");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    getRefereeMe,
    getMatchesByRefereeId,
    teams,
    getTeams,
    places,
    getPlaces,
  } = useTournamentContext();

  const [referee, setReferee] = useState<Referee | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const { updateReferee } = useTournamentContext();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "REFEREE") {
      setLoading(false);
      return;
    }

    const loadRefereeData = async () => {
      try {
        setLoading(true);
        const refereeProfile = await getRefereeMe();

        if (!refereeProfile) {
          setError(t("noProfile"));
          setLoading(false);
          return;
        }

        setReferee(refereeProfile);

        const refereeMatches = await getMatchesByRefereeId(refereeProfile.id);
        setMatches(refereeMatches);

        for (const tournamentId of refereeProfile.tournamentIds) {
          await getTeams(tournamentId);
          await getPlaces(tournamentId);
        }
      } catch (err) {
        console.error("Error loading referee data:", err);
        setError(tCommon("error"));
      } finally {
        setLoading(false);
      }
    };

    loadRefereeData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== UserRole.REFEREE) {
    return (
      <div className="py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {t("denyAccess")}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center text-muted-foreground">
          {tCommon("loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="display-title text-3xl md:text-4xl text-foreground">
        {t("title")}
      </h1>

      {referee && (
        <div className="bg-white p-6 rounded-xl border border-border shadow-card">
          <div className="flex items-center gap-4">
            {(previewUrl || referee.photoUrl) ? (
              <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={previewUrl || referee.photoUrl || ""}
                  alt={referee.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-display font-bold text-2xl flex-shrink-0">
                {referee.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                {t("welcome", { name: referee.name })}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("assignedTournaments", {
                  count: referee.tournamentIds.length,
                })}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              {t("photo")}
            </p>
            <div className="flex items-end gap-4">
              <PhotoUpload
                value={previewUrl || referee.photoUrl || undefined}
                onChange={(value) => {
                  if (value instanceof File) {
                    setPendingPhotoFile(value);
                    setPreviewUrl(URL.createObjectURL(value));
                  } else {
                    setPendingPhotoFile(null);
                    setPreviewUrl(null);
                  }
                }}
                folder="referees"
                deferUpload
              />
              {pendingPhotoFile && (
                <Button
                  size="sm"
                  onClick={async () => {
                    setSavingPhoto(true);
                    try {
                      const result = await uploadImage(pendingPhotoFile, "referees");
                      const updated = { ...referee, photoUrl: result.url };
                      await updateReferee(updated);
                      setReferee(updated);
                      setPendingPhotoFile(null);
                      setPreviewUrl(null);
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

      <h2 className="display-title text-2xl text-foreground">
        {t("myMatches")}
      </h2>

      {matches.length === 0 ? (
        <div className="bg-neutral-100 p-4 rounded-xl text-muted-foreground">
          {t("noMatches")}
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              teams={teams}
              places={places}
              t={t}
              tCommon={tCommon}
              onControl={() => router.push(`/manage/referee/match/${match.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  teams: Team[];
  places: Place[];
  t: any;
  tCommon: any;
  onControl: () => void;
}

function MatchCard({
  match,
  teams,
  places,
  t,
  tCommon,
  onControl,
}: MatchCardProps) {
  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

  const matchDate = typeof match.date === "string" ? new Date(match.date) : match.date;

  const ctaLabel =
    match.status === "scheduled"
      ? t("startMatch")
      : t("controlMatch");

  return (
    <div className="bg-white p-4 rounded-xl shadow-card border border-border">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground truncate">
            {teamA?.name || t("fallbackTeamA")} vs{" "}
            {teamB?.name || t("fallbackTeamB")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {matchDate.toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <PlaceLink place={getPlace(match.placeId, places)} />
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              match.status === "completed"
                ? "bg-brand-100 text-brand-700"
                : match.status === "live"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-sky-100 text-sky-700"
            }`}
          >
            {match.status === "completed"
              ? tCommon("status.completed")
              : match.status === "live"
                ? tCommon("status.live")
                : tCommon("status.scheduled")}
          </span>

          {match.result && (
            <span className="font-display text-xl font-black text-foreground">
              {match.result.scoreA} - {match.result.scoreB}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {(match.incidents || []).length > 0 && (
          <span className="text-xs text-muted-foreground">
            {(match.incidents || []).length} eventos
          </span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onControl}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
            match.status === "scheduled"
              ? "bg-brand-600 hover:bg-brand-700 text-white"
              : "bg-white border border-brand-600 text-brand-700 hover:bg-brand-50"
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
