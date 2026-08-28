"use client";

import React, { useEffect, useState } from "react";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  User as UserIcon,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";
import MatchForm from "./MatchForm";
import CreateRoundForm from "./CreateRoundForm";
import { TeamCrest } from "./TeamCrest";
import { Match } from "@/modules/tournament/domain/match";
import { Round } from "@/modules/tournament/domain/round";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import MatchTimeline from "./MatchTimeline";
import { PlaceLink } from "./PlaceLink";
import { getPlace } from "@/lib/places";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";

interface MatchesSectionProps {
  tournamentId: string;
  readOnly?: boolean;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({
  tournamentId,
  readOnly,
}) => {
  const t = useTranslations("Matches");
  const tCommon = useTranslations("Common");
  const {
    getMatches,
    matches,
    teams,
    getTeams,
    deleteMatch,
    deleteRound,
    getRounds,
    rounds,
    places,
    getPlaces,
    referees,
    getReferees,
    generateFixtures,
    tournaments,
  } = useTournamentContext();
  const { user, isAuthenticated } = useAuth();
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [openRoundFormId, setOpenRoundFormId] = useState<string | null>(null);

  const tournament = tournaments.find((t) => t.id === tournamentId);
  const isOwner = tournament?.ownerId === user?.id;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage = !readOnly && isAuthenticated && (isSuperAdmin || isOwner);

  useEffect(() => {
    async function fetchData() {
      try {
        await Promise.all([
          getMatches(tournamentId),
          getRounds(tournamentId),
          getTeams(tournamentId),
          getPlaces(tournamentId),
          getReferees(tournamentId),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [tournamentId, getMatches, getRounds, getTeams, getPlaces, getReferees]);

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || t("unknownTeam");
  };

  const getTeam = (teamId: string) => {
    return teams.find((t) => t.id === teamId);
  };

  const getRefereeName = (refereeId?: string) => {
    if (!refereeId) return null;
    return (
      referees.find((r) => r.id === refereeId)?.name || t("unknownReferee")
    );
  };

  const handleDelete = async (matchId: string) => {
    if (confirm(t("deleteConfirm"))) {
      try {
        await deleteMatch({ matchId, tournamentId });
        notify.success(t("deleteSuccess"));
      } catch (error: any) {
        notify.error(error?.message || t("deleteError"));
      }
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (confirm(t("deleteRoundConfirm"))) {
      try {
        await deleteRound({ roundId, tournamentId });
        notify.success(t("deleteRoundSuccess"));
      } catch (error: any) {
        notify.error(error?.message || t("deleteRoundError"));
      }
    }
  };

  const handleGenerateFixtures = async () => {
    if (confirm(t("generateConfirm"))) {
      try {
        await generateFixtures(tournamentId);
        notify.success(t("generateSuccess"));
      } catch (error: any) {
        notify.error(error?.message || tCommon("error"));
      }
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
  };

  const handleUpdateSuccess = () => {
    setEditingMatch(null);
    getMatches(tournamentId);
  };

  const toggleRoundForm = (roundId: string) => {
    setOpenRoundFormId(openRoundFormId === roundId ? null : roundId);
  };

  const matchesByRound: Record<string, Match[]> = {};
  const uncategorizedMatches: Match[] = [];

  matches.forEach((match) => {
    if (match.roundId) {
      if (!matchesByRound[match.roundId]) {
        matchesByRound[match.roundId] = [];
      }
      matchesByRound[match.roundId].push(match);
    } else {
      uncategorizedMatches.push(match);
    }
  });

  return (
    <div className="mt-8 space-y-10 pb-20 md:pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="display-title text-3xl text-foreground flex items-center gap-3">
            {t("title")}
            {rounds.length > 0 && (
              <Badge
                variant="outline"
                className="font-bold text-xs uppercase px-2 py-0 border-border text-muted-foreground"
              >
                {t("total", { count: rounds.length })}
              </Badge>
            )}
          </h2>
        </div>
      </header>

      {canManage && <CreateRoundForm tournamentId={tournamentId} />}

      {rounds.length === 0 && (
        <Card className="bg-brand-50/30 border-dashed border-2 border-brand-200 mt-6 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="p-5 rounded-3xl bg-white shadow-card ring-1 ring-brand-100">
              <Calendar className="h-10 w-10 text-brand-500" />
            </div>
            <div className="text-center space-y-2 max-w-sm">
              <h3 className="display-title text-2xl text-foreground tracking-tight">
                {t("emptyTitle")}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {t("emptyText")}
              </p>
            </div>
            {canManage && (
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleGenerateFixtures}
                  disabled={teams.length < 2}
                  className="bg-brand-600 hover:bg-brand-700 font-bold px-8 shadow-glow transition-all active:scale-95 group"
                >
                  <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  {t("generate")}
                </Button>
                {teams.length < 2 && (
                  <div className="flex items-center gap-2 text-xs text-brand-700 font-bold italic bg-white/50 px-4 py-2 rounded-full border border-brand-100/50">
                    <AlertCircle className="h-3 w-3" />
                    {t("needTeams")}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {rounds.map((round) => (
          <Card
            key={round.id}
            className="overflow-hidden border-border shadow-card bg-white rounded-2xl"
          >
            <CardHeader className="bg-neutral-50/70 px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex flex-row justify-between items-center">
              <CardTitle className="display-title text-xl text-foreground tracking-tight">
                {round.name}
              </CardTitle>
              {canManage && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRoundForm(round.id)}
                    className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-bold"
                  >
                    {openRoundFormId === round.id ? (
                      t("close")
                    ) : (
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                        <Plus className="h-3 w-3" /> {t("addMatch")}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("deleteRound")}
                    onClick={() => handleDeleteRound(round.id)}
                    disabled={(matchesByRound[round.id] || []).length > 0}
                    title={
                      (matchesByRound[round.id] || []).length > 0
                        ? t("deleteRoundLocked")
                        : t("deleteRound")
                    }
                    className="h-8 w-8 text-destructive disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {/* Matches List */}
              <div className="divide-y divide-border">
                {(matchesByRound[round.id] || []).map((match) => (
                  <div
                    key={match.id}
                    className="relative group transition-all duration-300 hover:bg-neutral-50/50"
                  >
                    {editingMatch?.id === match.id ? (
                      <div className="p-8 bg-muted/20 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="font-black text-lg">
                            {t("editMatch")}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            {tCommon("cancel")}
                          </Button>
                        </div>
                        <MatchForm
                          tournamentId={tournamentId}
                          initialValues={editingMatch}
                          onSubmit={handleUpdateSuccess}
                          submitLabel={t("update")}
                          title=""
                        />
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 flex flex-col items-center gap-4 sm:gap-6">
                        {/* Header Info */}
                        <div className="w-full flex justify-between items-start">
                          <Badge
                            className={`uppercase tracking-wider text-[10px] font-black px-2 py-0.5 rounded-md ${
                              match.status === "live"
                                ? "bg-status-live hover:bg-status-live group-hover:animate-pulse"
                                : match.status === "completed"
                                  ? "bg-brand-500 hover:bg-brand-500"
                                  : "bg-sky-600 hover:bg-sky-600"
                            }`}
                          >
                            {match.status === "live"
                              ? tCommon("status.live")
                              : match.status === "completed"
                                ? tCommon("status.completed")
                                : tCommon("status.scheduled")}
                          </Badge>

                          {canManage && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={tCommon("edit")}
                                onClick={() => handleEdit(match)}
                                className="h-8 w-8 text-brand-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={tCommon("delete")}
                                onClick={() => handleDelete(match.id)}
                                disabled={
                                  match.status === "completed" ||
                                  match.status === "live"
                                }
                                title={
                                  match.status === "completed" ||
                                  match.status === "live"
                                    ? t("deleteMatchLocked")
                                    : tCommon("delete")
                                }
                                className="h-8 w-8 text-destructive disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Score / Teams */}
                        <div className="w-full grid grid-cols-[1fr,auto,1fr] items-center gap-2 sm:gap-4 md:gap-12">
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-0">
                            <h4 className="font-display font-extrabold md:text-3xl tracking-tight text-foreground leading-tight group-hover:text-brand-600 transition-colors text-right truncate">
                              {getTeamName(match.teamAId)}
                            </h4>
                            <TeamCrest
                              crestId={getTeam(match.teamAId)?.crestUrl}
                              teamName={getTeamName(match.teamAId)}
                              size={24}
                              className="sm:hidden"
                            />
                            <TeamCrest
                              crestId={getTeam(match.teamAId)?.crestUrl}
                              teamName={getTeamName(match.teamAId)}
                              size={32}
                              className="hidden sm:grid md:hidden"
                            />
                            <TeamCrest
                              crestId={getTeam(match.teamAId)?.crestUrl}
                              teamName={getTeamName(match.teamAId)}
                              size={36}
                              className="hidden md:grid"
                            />
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-neutral-100 border border-border">
                            <span className="font-display text-xl md:text-4xl font-black tabular-nums text-foreground">
                              {match.result ? match.result.scoreA : "-"}
                            </span>
                            <span className="font-display text-neutral-400 font-bold text-xs sm:text-sm tracking-widest">
                              VS
                            </span>
                            <span className="font-display text-xl md:text-4xl font-black tabular-nums text-foreground">
                              {match.result ? match.result.scoreB : "-"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <TeamCrest
                              crestId={getTeam(match.teamBId)?.crestUrl}
                              teamName={getTeamName(match.teamBId)}
                              size={24}
                              className="sm:hidden"
                            />
                            <TeamCrest
                              crestId={getTeam(match.teamBId)?.crestUrl}
                              teamName={getTeamName(match.teamBId)}
                              size={32}
                              className="hidden sm:grid md:hidden"
                            />
                            <TeamCrest
                              crestId={getTeam(match.teamBId)?.crestUrl}
                              teamName={getTeamName(match.teamBId)}
                              size={36}
                              className="hidden md:grid"
                            />
                            <h4 className="font-display md:text-3xl font-extrabold tracking-tight text-foreground leading-tight group-hover:text-brand-600 transition-colors truncate">
                              {getTeamName(match.teamBId)}
                            </h4>
                          </div>
                        </div>

                        {/* Footer metadata */}
                        <div className="w-full flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-2 pt-4 border-t border-border/60">
                          <PlaceLink place={getPlace(match.placeId, places)} />
                          {match.refereeId && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              <UserIcon className="h-3 w-3 text-amber-500" />
                              {getRefereeName(match.refereeId)}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {new Date(match.date).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </div>
                        </div>

                        {/* Match Events Timeline */}
                        {match.incidents &&
                          match.incidents.length > 0 &&
                          (() => {
                            const teamA = teams.find(
                              (t) => t.id === match.teamAId,
                            );
                            const teamB = teams.find(
                              (t) => t.id === match.teamBId,
                            );
                            return teamA && teamB ? (
                              <div className="w-full mt-2 pt-6 border-t border-border/60 animate-in slide-in-from-top-1 duration-500">
                                <MatchTimeline
                                  incidents={match.incidents}
                                  teamA={teamA}
                                  teamB={teamB}
                                />
                              </div>
                            ) : null;
                          })()}
                      </div>
                    )}
                  </div>
                ))}
                {(matchesByRound[round.id] || []).length === 0 && (
                  <div className="text-muted-foreground italic text-center py-12 text-sm bg-neutral-50/30">
                    {t("noMatchesInRound")}
                  </div>
                )}
              </div>

              {/* Add Match Form */}
              {openRoundFormId === round.id && !editingMatch && (
                <div className="p-8 bg-brand-50/30 border-t border-border animate-in slide-in-from-top-2 duration-300">
                  <h4 className="font-black text-lg mb-6 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-brand-600" />
                    {t("addMatchToRound")}
                  </h4>
                  <MatchForm
                    tournamentId={tournamentId}
                    roundId={round.id}
                    onSubmit={() => {
                      setOpenRoundFormId(null);
                      getMatches(tournamentId);
                    }}
                    title=""
                    submitLabel={t("createMatch")}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {uncategorizedMatches.length > 0 && (
        <div className="mt-16 space-y-6">
          <h3 className="text-lg font-black text-muted-foreground uppercase tracking-[0.2em]">
            {t("uncategorized")}
          </h3>
          <div className="grid grid-cols-1 gap-4 opacity-60 hover:opacity-100 transition-opacity">
            {uncategorizedMatches.map((match) => (
              <Card key={match.id} className="p-4 bg-muted/10 border-dashed">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">
                    {getTeamName(match.teamAId)}
                  </span>
                  <span className="text-muted-foreground font-black text-[10px]">
                    VS
                  </span>
                  <span className="font-bold">
                    {getTeamName(match.teamBId)}
                  </span>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(match.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesSection;
