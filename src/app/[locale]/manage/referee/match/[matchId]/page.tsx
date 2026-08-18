"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Match } from "@/modules/tournament/domain/match";
import { Team } from "@/modules/tournament/domain/team";
import { Place } from "@/modules/places/domain/place";
import IncidentEditor from "@/components/IncidentEditor";
import { notify } from "@/lib/notify";
import { MapPin, Clock, Play, Pause, RotateCcw, UserCheck, Save } from "lucide-react";

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
    teams,
    places,
  } = useTournamentContext();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Match["status"]>("scheduled");

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Presence state
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(new Set());
  const [savingPresence, setSavingPresence] = useState(false);

  // Save indicator
  const [saving, setSaving] = useState(false);

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

      await getTeams(foundMatch.tournamentId);
      await getPlaces(foundMatch.tournamentId);
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

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const teamA = teams.find((t) => t.id === match?.teamAId);
  const teamB = teams.find((t) => t.id === match?.teamBId);
  const placeName = match?.placeId
    ? places.find((p) => p.id === match.placeId)?.name
    : null;

  const matchDate = match?.date
    ? typeof match.date === "string"
      ? new Date(match.date)
      : match.date
    : null;

  const handleStartMatch = async () => {
    if (!match) return;
    try {
      const updated: Match = { ...match, status: "live" };
      await updateMatch(updated);
      setMatch(updated);
      setStatus("live");
      setTimerRunning(true);
      notify.success("Partido iniciado");
    } catch (err) {
      notify.error("Error al iniciar el partido");
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

      const updated: Match = {
        ...match,
        result: { scoreA, scoreB },
        status: finalStatus,
        notes,
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
    try {
      setTimerRunning(false);
      const updated: Match = {
        ...match,
        status: "completed",
        result: { scoreA, scoreB },
        notes,
      };
      await updateMatch(updated);
      setMatch(updated);
      setStatus("completed");
      notify.success("Partido finalizado");
    } catch (err) {
      notify.error("Error al finalizar el partido");
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

  const handleAddIncident = async (incident: Omit<Match["incidents"][0], "id">) => {
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          Acceso denegado.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {error || "Partido no encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        type="button"
        onClick={() => router.push("/manage/referee")}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
      >
        ← Volver
      </button>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-border mb-6">
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
            {placeName && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {placeName}
              </p>
            )}
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
              {status === "completed" ? "Finalizado" : status === "live" ? "En Vivo" : "Programado"}
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex-1 text-right">
            <p className="font-bold text-foreground text-sm">{teamA?.name || "A"}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={scoreA}
              onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
              className="w-16 p-2 border border-input rounded-lg text-center font-display text-lg font-bold focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
            <span className="font-display text-xl font-bold text-muted-foreground">-</span>
            <input
              type="number"
              min="0"
              value={scoreB}
              onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
              className="w-16 p-2 border border-input rounded-lg text-center font-display text-lg font-bold focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-foreground text-sm">{teamB?.name || "B"}</p>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-border mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Tiempo</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-display text-4xl font-black text-foreground tabular-nums">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="flex items-center gap-2">
            {status === "scheduled" ? (
              <button
                type="button"
                onClick={handleStartMatch}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-all shadow-glow active:scale-95"
              >
                <Play className="h-4 w-4" /> Iniciar Partido
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    timerRunning
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-brand-600 hover:bg-brand-700 text-white"
                  }`}
                >
                  {timerRunning ? (
                    <><Pause className="h-3.5 w-3.5" /> Pausar</>
                  ) : (
                    <><Play className="h-3.5 w-3.5" /> Reanudar</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setTimerRunning(false); setElapsedSeconds(0); }}
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
      <div className="bg-white p-5 rounded-2xl shadow-card border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
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
                        <span className="text-muted-foreground ml-1">#{player.dorsal}</span>
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
      <div className="bg-white p-5 rounded-2xl shadow-card border border-border mb-6">
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
      <div className="bg-white p-5 rounded-2xl shadow-card border border-border mb-6">
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
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSaveResult}
          disabled={saving}
          className="flex-1 py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Resultado"}
        </button>
        {status !== "completed" && (
          <button
            type="button"
            onClick={handleFinishMatch}
            className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white font-bold transition-colors"
          >
            Finalizar Partido
          </button>
        )}
      </div>
    </div>
  );
}
