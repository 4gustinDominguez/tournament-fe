"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Referee } from "@/modules/referees/domain/referee";
import { Match } from "@/modules/tournament/domain/match";
import { Team } from "@/modules/tournament/domain/team";
import { useTranslations } from "next-intl";
import IncidentEditor from "@/components/IncidentEditor";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/services/imageService";
import { notify } from "@/lib/notify";

export default function RefereePage() {
  const t = useTranslations("Referee");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const {
    getRefereeMe,
    getMatchesByRefereeId,
    updateMatch,
    addMatchIncident,
    deleteMatchIncident,
    teams,
    getTeams,
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

        // Load matches for this referee
        const refereeMatches = await getMatchesByRefereeId(refereeProfile.id);
        setMatches(refereeMatches);

        // Load teams for all tournaments this referee is involved in
        for (const tournamentId of refereeProfile.tournamentIds) {
          await getTeams(tournamentId);
        }
      } catch (err) {
        console.error("Error loading referee data:", err);
        setError(tCommon("error"));
      } finally {
        setLoading(false);
      }
    };

    loadRefereeData();
  }, [
    isAuthenticated,
    user,
    // Dependencies removed to prevent infinite loop as they are not memoized in context
    // getRefereeMe,
    // getMatchesByRefereeId,
    // getTeams,
  ]);

  const handleMatchUpdate = async (updatedMatch: Match) => {
    try {
      await updateMatch(updatedMatch);
      notify.success(t("matchSaved"));

      // Reload matches if needed, though context should handle it
      if (referee) {
        const updatedMatches = await getMatchesByRefereeId(referee.id);
        setMatches(updatedMatches);
      }
    } catch (err) {
      console.error("Error updating match:", err);
      notify.error(err instanceof Error ? err.message : t("matchError"));
    }
  };

  if (
    !isAuthenticated ||
    user?.role !== UserRole.REFEREE
    // || user.role !== UserRole.SUPER_ADMIN
  ) {
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

      {referee && (
        <div className="bg-white p-4 rounded-xl border border-border shadow-card mb-6">
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

      <h2 className="font-display text-2xl font-black text-foreground mb-4">
        {t("myMatches")}
      </h2>

      {matches.length === 0 ? (
        <div className="bg-neutral-100 p-4 rounded-lg text-muted-foreground">
          {t("noMatches")}
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              teams={teams}
              onUpdateMatch={handleMatchUpdate}
              onAddIncident={async (incident) => {
                await addMatchIncident(match.id, incident);
                if (referee) {
                  const updatedMatches = await getMatchesByRefereeId(
                    referee.id,
                  );
                  setMatches(updatedMatches);
                }
              }}
              onRemoveIncident={async (incidentId) => {
                await deleteMatchIncident(match.id, incidentId);
                if (referee) {
                  const updatedMatches = await getMatchesByRefereeId(
                    referee.id,
                  );
                  setMatches(updatedMatches);
                }
              }}
              t={t}
              tCommon={tCommon}
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
  onUpdateMatch: (updatedMatch: Match) => Promise<void>;
  onAddIncident: (incident: Omit<Match["incidents"][0], "id">) => Promise<void>;
  onRemoveIncident: (incidentId: string) => Promise<void>;
  t: any;
  tCommon: any;
}

function MatchCard({
  match,
  teams,
  onUpdateMatch,
  onAddIncident,
  onRemoveIncident,
  t,
  tCommon,
}: MatchCardProps) {
  const [scoreA, setScoreA] = useState(match.result?.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match.result?.scoreB ?? 0);
  const [status, setStatus] = useState(match.status);
  const [notes, setNotes] = useState(match.notes || "");
  const [showIncidents, setShowIncidents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

  // Sync state if match prop changes from parent
  useEffect(() => {
    setScoreA(match.result?.scoreA ?? 0);
    setScoreB(match.result?.scoreB ?? 0);
    setStatus(match.status);
    setNotes(match.notes || "");
  }, [match]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const matchDate =
        typeof match.date === "string" ? new Date(match.date) : match.date;

      // Auto-live if scores added and it was scheduled, but respect manual status if it was changed
      let finalStatus = status;
      if (status === "scheduled" && (scoreA > 0 || scoreB > 0)) {
        finalStatus = "live";
      }

      const updatedMatch: Match = {
        ...match,
        date: matchDate,
        result: { scoreA, scoreB },
        incidents: match.incidents || [],
        status: finalStatus,
        notes,
      };
      await onUpdateMatch(updatedMatch);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-card border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {teamA?.name || t("fallbackTeamA")} vs{" "}
            {teamB?.name || t("fallbackTeamB")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {new Date(match.date).toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
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

          <div className="flex gap-1">
            {(["scheduled", "live", "completed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  status === s
                    ? "bg-brand-600 border-brand-600 text-white font-bold"
                    : "bg-neutral-50 border-border text-muted-foreground hover:bg-neutral-100"
                }`}
                title={t("changeStatus", { status: tCommon(`status.${s}`) })}
              >
                {s === "scheduled" ? "📅" : s === "live" ? "⚽" : "🏆"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("scoreA")}
            </label>
            <input
              type="number"
              min="0"
              value={scoreA}
              onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="font-display text-2xl font-bold text-neutral-400 mt-6">
            VS
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("scoreB")}
            </label>
            <input
              type="number"
              min="0"
              value={scoreB}
              onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowIncidents(!showIncidents)}
            className="text-sm font-bold text-foreground flex items-center gap-2 hover:text-brand-600 transition-colors"
          >
            {showIncidents
              ? `🔽 ${t("hideIncidents")}`
              : `🔼 ${t("manageIncidents")}`}
            {(match.incidents || []).length > 0 && (
              <span className="bg-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded-full">
                {(match.incidents || []).length}
              </span>
            )}
          </button>

          {showIncidents && teamA && teamB && (
            <div className="mt-4 bg-neutral-50 p-4 rounded-xl border border-border">
              <IncidentEditor
                teamA={teamA}
                teamB={teamB}
                incidents={match.incidents || []}
                onAdd={onAddIncident}
                onRemove={onRemoveIncident}
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            rows={3}
            placeholder={t("notesPlaceholder")}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`mt-4 w-full py-2.5 px-4 rounded-lg text-white font-bold transition-colors ${
            submitting
              ? "bg-neutral-400 cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          {submitting ? tCommon("loading") : t("enterResult")}
        </button>
      </form>
    </div>
  );
}
