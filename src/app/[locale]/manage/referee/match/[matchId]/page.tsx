"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Match } from "@/modules/tournament/domain/match";
import { Team } from "@/modules/tournament/domain/team";
import { Tournament } from "@/modules/tournament/domain/tournament";
import IncidentEditor from "@/components/IncidentEditor";
import { PlaceLink } from "@/components/PlaceLink";
import { getPlace } from "@/lib/places";
import { notify } from "@/lib/notify";
import {
  MapPin,
  Clock,
  Play,
  Pause,
  RotateCcw,
  UserCheck,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function MatchControlPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    getMatchById,
    getTeams,
    getPlaces,
    updateMatch,
    addMatchIncident,
    deleteMatchIncident,
    getTournamentById,
    teams,
    places,
  } = useTournamentContext();

  const [match, setMatch] = useState<Match | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Match["status"]>("scheduled");

  const [baseElapsedSeconds, setBaseElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [effectiveElapsedSeconds, setEffectiveElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cap warning state
  const [timeUpWarned, setTimeUpWarned] = useState(false);

  // Presence state
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [savingPresence, setSavingPresence] = useState(false);

  // Save indicator
  const [saving, setSaving] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        setEffectiveElapsedSeconds(baseElapsedSeconds + (startedAtMs ? Math.floor((now - startedAtMs) / 1000) : 0));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, baseElapsedSeconds, startedAtMs]);

  // Check cap warning
  useEffect(() => {
    if (
      tournament?.matchDurationMinutes &&
      effectiveElapsedSeconds >= tournament.matchDurationMinutes * 60 &&
      !timeUpWarned
    ) {
      setTimeUpWarned(true);
      notify.warning("Tiempo cumplido");
    }
  }, [effectiveElapsedSeconds, tournament?.matchDurationMinutes, timeUpWarned]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const foundMatch = await getMatchById(matchId);
      if (!foundMatch) {
        setError("Partido no encontrado");
        return;
      }
      setMatch(foundMatch);
      setScoreA(foundMatch.result?.scoreA ?? 0);
      setScoreB(foundMatch.result?.scoreB ?? 0);
      setNotes(foundMatch.notes || "");
      setStatus(foundMatch.status);
      setPresentPlayerIds(new Set(foundMatch.presentPlayerIds || []));

      // Initialize timer state from persisted match
      setBaseElapsedSeconds(foundMatch.timerElapsedSeconds ?? 0);
      setIsRunning(foundMatch.timerRunning ?? false);
      const started = foundMatch.timerStartedAt
        ? new Date(foundMatch.timerStartedAt).getTime()
        : null;
      setStartedAtMs(started);
      setEffectiveElapsedSeconds(
        foundMatch.timerRunning && started
          ? (foundMatch.timerElapsedSeconds ?? 0) +
            Math.floor((Date.now() - started) / 1000)
          : foundMatch.timerElapsedSeconds ?? 0,
      );

      await getTeams(foundMatch.tournamentId);
      await getPlaces(foundMatch.tournamentId);

      // Load tournament for match duration cap
      const tournamentData = await getTournamentById(foundMatch.tournamentId);
      setTournament(tournamentData);
    } catch (err) {
      console.error("Error loading match:", err);
      setError("Error al cargar el partido");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.REFEREE) {
      setLoading(false);
      return;
    }
    loadData();
  }, [isAuthenticated, user]);

  const persistTimer = async (
    base: number,
    running: boolean,
    started: number | null,
  ) => {
    if (!match) return;
    const updated: Match = {
      ...match,
      timerElapsedSeconds: base,
      timerRunning: running,
      timerStartedAt: started ? new Date(started).toISOString() : null,
    };
    await updateMatch(updated);
    setMatch(updated);
  };

  const handleStartMatch = async () => {
    if (!match) return;
    const now = Date.now();
    try {
      const updated: Match = {
        ...match,
        status: "live",
        timerElapsedSeconds: 0,
        timerRunning: true,
        timerStartedAt: new Date(now).toISOString(),
      };
      await updateMatch(updated);
      setMatch(updated);
      setBaseElapsedSeconds(0);
      setEffectiveElapsedSeconds(0);
      setIsRunning(true);
      setStartedAtMs(now);
      setTimeUpWarned(false);
      setStatus("live");
      notify.success("Partido iniciado");
    } catch (err) {
      notify.error("Error al iniciar el partido");
    }
  };

  const handlePauseMatch = async () => {
    if (!match) return;
    const currentElapsed =
      baseElapsedSeconds +
      (startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0);
    try {
      await persistTimer(currentElapsed, false, null);
      setBaseElapsedSeconds(currentElapsed);
      setEffectiveElapsedSeconds(currentElapsed);
      setIsRunning(false);
      setStartedAtMs(null);
    } catch (err) {
      notify.error("Error al pausar");
    }
  };

  const handleResumeMatch = async () => {
    if (!match) return;
    const now = Date.now();
    try {
      await persistTimer(baseElapsedSeconds, true, now);
      setIsRunning(true);
      setStartedAtMs(now);
    } catch (err) {
      notify.error("Error al reanudar");
    }
  };

  const handleResetTimer = async () => {
    if (!match) return;
    try {
      await persistTimer(0, false, null);
      setBaseElapsedSeconds(0);
      setEffectiveElapsedSeconds(0);
      setIsRunning(false);
      setStartedAtMs(null);
      setTimeUpWarned(false);
    } catch (err) {
      notify.error("Error al reiniciar timer");
    }
  };

  const handleSaveResult = async () => {
    if (!match) return;
    setSaving(true);
    try {
      let finalStatus = status;
      if (status === "scheduled" && (scoreA > 0 || scoreB > 0)) {
        finalStatus = "live";
      }
      const currentElapsed =
        baseElapsedSeconds +
        (startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0);
      const persistedElapsed = isRunning ? baseElapsedSeconds : currentElapsed;
      const updated: Match = {
        ...match,
        result: { scoreA, scoreB },
        status: finalStatus,
        notes,
        timerElapsedSeconds: persistedElapsed,
        timerRunning: isRunning,
        timerStartedAt:
          isRunning && startedAtMs ? new Date(startedAtMs).toISOString() : null,
      };
      await updateMatch(updated);
      setMatch(updated);
      setStatus(finalStatus);
      notify.success("Resultado guardado");
    } catch (err) {
      notify.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePresence = async () => {
    if (!match) return;
    setSavingPresence(true);
    try {
      const updated: Match = {
        ...match,
        presentPlayerIds: Array.from(presentPlayerIds),
      };
      await updateMatch(updated);
      setMatch(updated);
      notify.success("Presencia guardada");
    } catch (err) {
      notify.error("Error al guardar presencia");
    } finally {
      setSavingPresence(false);
    }
  };

  const handleFinishMatch = async () => {
    if (!match) return;
    const currentElapsed =
      baseElapsedSeconds +
      (startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0);
    setSaving(true);
    try {
      const updated: Match = {
        ...match,
        status: "completed",
        result: { scoreA, scoreB },
        notes,
        timerElapsedSeconds: currentElapsed,
        timerRunning: false,
        timerStartedAt: null,
      };
      await updateMatch(updated);
      setMatch(updated);
      setStatus("completed");
      setIsRunning(false);
      setStartedAtMs(null);
      setBaseElapsedSeconds(currentElapsed);
      setEffectiveElapsedSeconds(currentElapsed);
      notify.success("Partido finalizado");
    } catch (err) {
      notify.error("Error al finalizar el partido");
    } finally {
      setSaving(false);
    }
  };

  const togglePlayerPresent = (playerId: string) => {
    setPresentPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleAddIncident = async (
    incident: Omit<Match["incidents"][0], "id">,
  ) => {
    if (!match) return;
    await addMatchIncident(match.id, incident);
    const updated = await getMatchById(match.id);
    if (updated) {
      setMatch(updated);
    }
  };

  const handleRemoveIncident = async (incidentId: string) => {
    if (!match) return;
    await deleteMatchIncident(match.id, incidentId);
    const updated = await getMatchById(match.id);
    if (updated) {
      setMatch(updated);
    }
  };

  if (!isAuthenticated || user?.role !== UserRole.REFEREE) {
    return (
      <div className="py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          Acceso denegado.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {error || "Partido no encontrado"}
        </div>
      </div>
    );
  }

  const teamA = teams.find((t) => t.id === match?.teamAId);
  const teamB = teams.find((t) => t.id === match?.teamBId);

  const matchDate = match?.date
    ? typeof match.date === "string"
      ? new Date(match.date)
      : match.date
    : null;

  const isTimeUp = tournament?.matchDurationMinutes
    ? effectiveElapsedSeconds >= tournament.matchDurationMinutes * 60
    : false;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button
        type="button"
        onClick={() => router.push("/manage/referee")}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
      >
        ← Volver
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-card border border-border">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-foreground truncate">
              {teamA?.name || "Equipo A"} vs {teamB?.name || "Equipo B"}
            </h1>
            {matchDate && (
              <p className="text-sm text-muted-foreground mt-1">
                {matchDate.toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
            <PlaceLink place={getPlace(match?.placeId, places)} />
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === "completed"
                  ? "bg-brand-100 text-brand-700"
                  : status === "live"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sky-100 text-sky-700"
              }`}
            >
              {status === "completed"
                ? "Finalizado"
                : status === "live"
                  ? "En Vivo"
                  : "Programado"}
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
          <div className="flex-1 min-w-0 text-right">
            <p className="font-bold text-foreground text-sm truncate">
              {teamA?.name || "A"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={scoreA}
              onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
              className="w-16 p-2 border border-input rounded-lg text-center font-display text-lg font-bold focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
            <span className="font-display text-xl font-bold text-muted-foreground">
              -
            </span>
            <input
              type="number"
              min="0"
              value={scoreB}
              onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
              className="w-16 p-2 border border-input rounded-lg text-center font-display text-lg font-bold focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-bold text-foreground text-sm truncate">
              {teamB?.name || "B"}
            </p>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div
        className={`bg-white p-6 rounded-2xl shadow-card border ${isTimeUp ? "border-amber-400" : "border-border"}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <Clock
            className={`h-4 w-4 ${isTimeUp ? "text-amber-500" : "text-muted-foreground"}`}
          />
          <h2
            className={`text-sm font-bold uppercase tracking-wider ${isTimeUp ? "text-amber-700" : "text-foreground"}`}
          >
            Tiempo
          </h2>
          {isTimeUp && (
            <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
              <AlertTriangle className="h-3 w-3" /> Tiempo cumplido
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={`font-display text-4xl font-black tabular-nums ${isTimeUp ? "text-amber-600" : "text-foreground"}`}
          >
            {formatTime(effectiveElapsedSeconds)}
          </div>
          <div className="flex items-center gap-2">
            {status === "scheduled" ? (
              <button
                type="button"
                onClick={handleStartMatch}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-all shadow-glow active:scale-95"
              >
                <Play className="h-4 w-4" /> Iniciar Partido
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={isRunning ? handlePauseMatch : handleResumeMatch}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    isRunning
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-brand-600 hover:bg-brand-700 text-white"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Reanudar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-muted-foreground text-sm font-bold transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Presence */}
      <div className="bg-white p-6 rounded-2xl shadow-card border border-border">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Jugadores Presentes
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSavePresence}
            disabled={savingPresence}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            {savingPresence ? "Guardando..." : "Guardar"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[teamA, teamB].filter(Boolean).map((team) => (
            <div key={team!.id}>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {team!.name}
              </h3>
              <div className="space-y-1">
                {(team!.player || []).map((player) => (
                  <label
                    key={player.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={presentPlayerIds.has(player.id)}
                      onChange={() => togglePlayerPresent(player.id)}
                      className="h-4 w-4 rounded border-input text-brand-600 focus:ring-brand-500/40"
                    />
                    <span className="text-sm text-foreground">
                      {player.name}
                      {player.dorsal != null && (
                        <span className="text-muted-foreground ml-1">
                          #{player.dorsal}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
                {(!team!.player || team!.player.length === 0) && (
                  <p className="text-xs text-muted-foreground">Sin jugadores</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incidents */}
      <div className="bg-white p-6 rounded-2xl shadow-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Eventos / Incidentes
          </h2>
          {(match.incidents || []).length > 0 && (
            <span className="bg-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {(match.incidents || []).length}
            </span>
          )}
        </div>
        {teamA && teamB && (
          <IncidentEditor
            teamA={teamA}
            teamB={teamB}
            incidents={match.incidents || []}
            onAdd={handleAddIncident}
            onRemove={handleRemoveIncident}
          />
        )}
      </div>

      {/* Notes */}
      <div className="bg-white p-6 rounded-2xl shadow-card border border-border">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
          Acta del Partido / Notas
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none text-sm"
          rows={3}
          placeholder="Observaciones, expulsiones, campo en mal estado..."
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSaveResult}
          disabled={saving}
          className="flex-1 py-2 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Resultado"}
        </button>
        {status !== "completed" && (
          <button
            type="button"
            onClick={handleFinishMatch}
            disabled={saving}
            className="flex-1 py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white font-bold transition-colors disabled:opacity-50"
          >
            {saving ? "Finalizando..." : "Finalizar Partido"}
          </button>
        )}
      </div>
    </div>
  );
}
