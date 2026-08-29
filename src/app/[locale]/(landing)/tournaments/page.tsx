"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, MapPin, Eye } from "lucide-react";
import { Link } from "@/navigation";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";

export default function TournamentsPage() {
  const t = useTranslations("Tournaments");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-brand-50 text-brand-700";
      case "ongoing":
        return "bg-amber-100 text-amber-700";
      case "finished":
        return "bg-neutral-100 text-muted-foreground";
      default:
        return "bg-neutral-100 text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return t("upcoming");
      case "ongoing":
        return t("ongoing");
      case "finished":
        return t("finished");
      default:
        return status;
    }
  };

  const { tournaments } = useTournamentContext();
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setFirstRender(false);
  }, []);

  const isLoading = firstRender;
  const hasTournaments = tournaments.length > 0;

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32 bg-night-900 relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[60%] bg-brand-600/25 rounded-full blur-[120px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
            {t("title")}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-night-200 leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 bg-white rounded-3xl shadow-card animate-pulse"
                />
              ))}
            </div>
          ) : hasTournaments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {tournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="shadow-card border-border bg-white hover:shadow-elevated transition-all duration-300 transform hover:-translate-y-1 rounded-2xl"
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <Badge
                        className={`${getStatusColor(
                          tournament.status || "ongoing",
                        )} border-0 font-bold`}
                      >
                        {getStatusText(tournament.status || "ongoing")}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {tournament.category || t("general")}
                      </Badge>
                    </div>
                    <CardTitle className="font-display text-2xl font-bold text-foreground leading-tight">
                      {tournament.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {tournament.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {tournament.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {t("teamsCount", { count: tournament.teams?.length ?? 0 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Trophy className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {tournament.category || t("general")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Link href={`/t/${tournament.slug || tournament.id}`}>
                        <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-card transform hover:scale-[1.02] transition-all">
                          <Eye className="mr-2 h-4 w-4" />
                          {t("viewDetails")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed border-border rounded-2xl">
              <Trophy className="mx-auto h-16 w-16 text-neutral-300 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t("emptyTitle")}
              </h3>
              <p className="text-muted-foreground">
                {t("emptyText")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {t("ctaTitle")}
          </h2>
          <p className="text-xl text-emerald-200 mb-8 max-w-2xl mx-auto">
            {t("ctaText")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-brand-700 hover:bg-neutral-100 font-bold px-8 py-3 rounded-lg shadow-card"
              >
                {t("createTournament")}
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white font-bold px-8 py-3 rounded-lg"
              >
                {t("contactSupport")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
