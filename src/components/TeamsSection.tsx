"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/navigation";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import CreateTeamForm from "./CreateTeamForm";
import { TeamCrest } from "./TeamCrest";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, ChevronRight, MapPin, Trash2, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";

interface TeamsSectionProps {
  tournamentId: string;
  readOnly?: boolean;
}

const TeamsSection: React.FC<TeamsSectionProps> = ({ tournamentId, readOnly }) => {
  const t = useTranslations("Teams");
  const tCommon = useTranslations("Common");
  const {
    getTeams,
    teams,
    places,
    getPlaces,
    tournaments,
    deleteTeam,
    matches,
    getMatches,
  } = useTournamentContext();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  const isPublic = readOnly === true;
  const tournament = tournaments.find((t) => t.id === tournamentId);
  const isOwner = tournament?.ownerId === user?.id;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage = !isPublic && isAuthenticated && (isSuperAdmin || isOwner);

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      try {
        await Promise.all([
          getTeams(tournamentId),
          getPlaces(tournamentId),
          getMatches(tournamentId),
        ]);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, [tournamentId, getTeams, getPlaces, getMatches]);

  const getPlaceName = (placeId?: string) => {
    if (!placeId) return null;
    return places.find((p) => p.id === placeId)?.name || t("unknownPlace");
  };

  const handleDeleteTeam = async (e: React.MouseEvent, teamId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(t("deleteConfirm"))) {
      try {
        await deleteTeam({ teamId, tournamentId });
        notify.success(t("deleteSuccess"));
      } catch (error: any) {
        notify.error(error?.message || t("deleteError"));
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="display-title text-2xl md:text-3xl text-foreground">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("count", { count: teams.length })}
          </p>
        </div>
      </header>

      {teams.length === 0 ? (
        <Card className="bg-neutral-50/50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center space-y-1">
              <p className="display-title text-2xl text-foreground tracking-tight">
                {t("emptyTitle")}
              </p>
              <p className="text-sm text-muted-foreground/70 italic">
                {t("emptyText")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {teams.map((team) => {
            const teamHasMatches = matches.some(
              (m) => m.teamAId === team.id || m.teamBId === team.id
            );
            const teamCard = (
              <Card className="group h-full transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamCrest crestId={team.crestUrl} teamName={team.name} size={40} />
                      <CardTitle className="display-title text-xl text-foreground tracking-tight group-hover:text-brand-600 transition-colors line-clamp-1">
                        {team.name}
                      </CardTitle>
                    </div>
                    {!readOnly && (
                      <div className="p-2 rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all flex-shrink-0">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {team.placeId && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {getPlaceName(team.placeId)}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardFooter className="pt-0 flex items-center justify-between border-t border-border bg-neutral-50/50 rounded-b-xl px-6 py-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Users className="h-3 w-3" />
                    <span>
                      {t("playersCount", { count: team.player?.length || 0 })}
                    </span>
                  </div>
                  {!readOnly &&
                    (canManage ? (
                      teamHasMatches ? (
                        <span
                          className="inline-flex items-center gap-1.5 h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60"
                          title={t("deleteLocked")}
                        >
                          <Lock className="h-3 w-3" />
                          {tCommon("delete")}
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteTeam(e, team.id)}
                          className="h-8 text-destructive hover:text-destructive hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {tCommon("delete")}
                        </Button>
                      )
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-white border-border text-[10px] font-bold group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors"
                      >
                        {t("viewProfile")}
                      </Badge>
                    ))}
                </CardFooter>
              </Card>
            );

            return readOnly ? (
              <div key={team.id} className="h-full">
                {teamCard}
              </div>
            ) : (
              <Link
                key={team.id}
                href={`/manage/my-tournaments/${tournamentId}/${team.id}`}
              >
                {teamCard}
              </Link>
            );
          })}
        </div>
      )}

      {canManage && (
        <div className="pt-12 border-t border-border">
          <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="bg-neutral-50/50 px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="display-title text-xl text-foreground">{t("enrollNew")}</h3>
            </div>
            <div className="p-6">
              <CreateTeamForm tournamentId={tournamentId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsSection;
