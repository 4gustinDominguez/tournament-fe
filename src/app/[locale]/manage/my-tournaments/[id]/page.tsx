"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BarChart3, Users, Settings2, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import TournamentItem from "@/components/TournamentItem";
import TeamsSection from "@/components/TeamsSection";
import MatchesSection from "@/components/MatchesSection";
import StandingsSection from "@/components/StandingsSection";
import { PlacesSection } from "@/components/PlacesSection";
import RefereeSection from "@/components/RefereeSection";

type TabType = "matches" | "standings" | "teams" | "infra" | "info";

export default function Page({ params }: { params: { id: string } }) {
  const t = useTranslations("TournamentDetail");
  const tabs = [
    { id: "matches", label: t("tabs.matches"), icon: CalendarDays },
    { id: "standings", label: t("tabs.standings"), icon: BarChart3 },
    { id: "teams", label: t("tabs.teams"), icon: Users },
    { id: "infra", label: t("tabs.infra"), icon: Settings2 },
    { id: "info", label: t("tabs.info"), icon: Info },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="display-title text-3xl md:text-4xl text-foreground flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
              <CalendarDays className="h-5 w-5" />
            </span>
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {t("subtitle")}
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit px-3 py-1 font-mono text-xs uppercase tracking-wider border-border text-muted-foreground"
        >
          {t("id", { id: params.id.slice(0, 8) })}
        </Badge>
      </header>

      <Tabs defaultValue="matches" className="w-full">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <TabsList className="grid w-full grid-cols-5 md:w-auto md:inline-flex p-1 bg-neutral-100 rounded-xl gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col md:flex-row items-center gap-1.5 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-card data-[state=active]:text-brand-700 data-[state=active]:ring-1 data-[state=active]:ring-brand-100 transition-all rounded-lg"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] md:text-sm font-bold md:font-semibold uppercase md:capitalize">
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div>
          <TabsContent
            value="matches"
            className="animate-in fade-in-50 duration-500"
          >
            <MatchesSection tournamentId={params.id} />
          </TabsContent>
          <TabsContent
            value="teams"
            className="animate-in fade-in-50 duration-500"
          >
            <TeamsSection tournamentId={params.id} />
          </TabsContent>

          <TabsContent
            value="infra"
            className="animate-in fade-in-50 duration-500"
          >
            <PlacesSection tournamentId={params.id} />
            <RefereeSection tournamentId={params.id} />
          </TabsContent>

          <TabsContent
            value="standings"
            className="animate-in fade-in-50 duration-500"
          >
            <StandingsSection tournamentId={params.id} />
          </TabsContent>
          <TabsContent
            value="info"
            className="animate-in fade-in-50 duration-500"
          >
            <Card className="mt-8 border-border shadow-card rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <TournamentItem id={params.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
