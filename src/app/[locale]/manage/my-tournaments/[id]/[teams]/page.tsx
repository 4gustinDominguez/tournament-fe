"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import CreatePlayerForm from "@/components/CreatePlayerForm";
import EditTeamForm from "@/components/EditTeamForm";
import FormationBoard from "@/components/FormationBoard";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Team } from "@/modules/tournament/domain/team";
import { Link } from "@/navigation";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type KitPattern =
  | "solid"
  | "horizontal-stripes"
  | "vertical-stripes"
  | "quartered"
  | "sash";

export default function TeamPage() {
  const t = useTranslations("TeamPage");
  const tForm = useTranslations("EditTeamForm");
  const tStats = useTranslations("PlayerStats");
  const params = useParams();
  const tournamentId = params.id as string;
  const teamId = params.teams as string;

  const { getTeams, teams, tournaments, updateTeam } = useTournamentContext();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("kit");

  const tournament = tournaments.find((t) => String(t.id) === tournamentId);
  const isOwner = tournament?.ownerId === user?.id;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage = isAuthenticated && (isSuperAdmin || isOwner);

  const team = teams.find((t) => String(t.id) === teamId);

  const [formState, setFormState] = useState<{
    coach: string;
    crestUrl: string;
    kitPattern: KitPattern;
    kitColors: string[];
    formation: Team["formation"];
  }>({
    coach: "",
    crestUrl: "",
    kitPattern: "solid",
    kitColors: ["#000000"],
    formation: undefined,
  });

  useEffect(() => {
    async function fetchTeamData() {
      setLoading(true);
      try {
        await getTeams(tournamentId);
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (tournamentId && !team) {
      fetchTeamData();
    } else if (team) {
      setFormState({
        coach: team.coach || "",
        crestUrl: team.crestUrl || "",
        kitPattern: team.kitPattern || "solid",
        kitColors:
          team.kitColors && team.kitColors.length > 0
            ? team.kitColors
            : team.kitColor
              ? [team.kitColor]
              : ["#000000"],
        formation: team.formation,
      });
      setLoading(false);
    }
  }, [tournamentId, team, getTeams]);

  const handleInputChange = useCallback(
    (field: "coach" | "crestUrl", value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleKitChange = useCallback(
    (patch: Partial<Pick<Team, "kitPattern" | "kitColors">>) => {
      setFormState((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const handleFormationChange = useCallback((formation: Team["formation"]) => {
    setFormState((prev) => ({ ...prev, formation }));
  }, []);

  async function handleSave() {
    if (!team || saving) return;
    setSaving(true);
    try {
      const updatedTeam: Team = {
        ...team,
        coach: formState.coach || "",
        crestUrl: formState.crestUrl || "",
        kitPattern: formState.kitPattern,
        kitColors: formState.kitColors,
        formation: formState.formation,
      };
      await updateTeam({ tournamentId, team: updatedTeam });
      await getTeams(tournamentId);
      alert(tForm("success"));
    } catch (error) {
      console.error("Error saving team:", error);
      alert(tForm("error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !team)
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  if (!team)
    return (
      <div className="p-8 text-center text-destructive">{t("notFound")}</div>
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="display-title text-3xl md:text-4xl text-foreground flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
              <Users className="h-5 w-5" />
            </span>
            {team.name}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {t("subtitle")}
          </p>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="display-title text-2xl text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold">
                {team.player?.length || 0}
              </span>
              {t("players")}
            </h2>

            {!team.player || team.player.length === 0 ? (
              <p className="text-muted-foreground italic bg-neutral-50 p-4 rounded-lg border border-dashed border-border">
                {t("noPlayers")}
              </p>
            ) : (
              <ul className="space-y-3">
                {team.player.map((player) => (
                  <li key={player.id}>
                    <Link
                      href={`/manage/my-tournaments/${tournamentId}/${teamId}/${player.id}`}
                      className="flex items-center justify-between p-3 bg-white hover:bg-brand-50 rounded-xl border border-border shadow-sm hover:shadow-elevated transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-border flex-shrink-0">
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              👤
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-brand-700 transition-colors">
                            {player.name}
                          </div>
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                            {player.position || t("noPosition")} • @
                            {player.nickname}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {player.statistics && (
                          <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-muted-foreground">
                            <span title={tStats("goals")}>
                              ⚽ {player.statistics.goals}
                            </span>
                            <span title={tStats("matches")}>
                              🏟️ {player.statistics.matchesPlayed}
                            </span>
                          </div>
                        )}
                        <div className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          &rarr;
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canManage && (
            <div className="w-full md:w-80">
              <CreatePlayerForm teamId={teamId} tournamentId={tournamentId} />
            </div>
          )}
        </div>
      </div>

      {canManage && (
        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="bg-neutral-50/50 p-4 border-b border-border flex items-center justify-between gap-3">
            <h2 className="display-title text-xl text-foreground">
              {t("teamConfig")}
            </h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`py-2 px-4 rounded-lg text-white font-bold transition duration-200 shadow-card text-sm ${
                saving
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {saving ? tForm("saving") : tForm("save")}
            </button>
          </div>
          <div className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="details">{tForm("details")}</TabsTrigger>
                <TabsTrigger value="kit">{tForm("kitPreview")}</TabsTrigger>
                <TabsTrigger value="formation">
                  {tForm("formationTitle")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      {tForm("coach")}
                    </label>
                    <input
                      type="text"
                      value={formState.coach}
                      onChange={(e) =>
                        handleInputChange("coach", e.target.value)
                      }
                      placeholder={tForm("coachPlaceholder")}
                      className="w-full border border-input rounded-lg px-3 py-2 bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      {tForm("crestUrl")}
                    </label>
                    <input
                      type="url"
                      value={formState.crestUrl}
                      onChange={(e) =>
                        handleInputChange("crestUrl", e.target.value)
                      }
                      placeholder={tForm("crestUrlPlaceholder")}
                      className="w-full border border-input rounded-lg px-3 py-2 bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="kit">
                <EditTeamForm
                  team={team}
                  kitPattern={formState.kitPattern}
                  kitColors={formState.kitColors}
                  onKitChange={handleKitChange}
                />
              </TabsContent>
              <TabsContent value="formation">
                <FormationBoard
                  team={team}
                  formation={formState.formation}
                  onFormationChange={handleFormationChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link
          href={`/manage/my-tournaments/${tournamentId}`}
          className="text-brand-600 hover:text-brand-800 font-medium transition-colors"
        >
          &larr; {t("back")}
        </Link>
      </div>
    </div>
  );
}
