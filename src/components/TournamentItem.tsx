import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function TournamentItem({ id }: { id: string }) {
  const { tournaments, teams } = useTournamentContext();
  const t = useTranslations("TournamentDetail");
  const tCommon = useTranslations("Common");
  const tournament = tournaments.find((t) => t.id === id);

  if (!tournament) return null;

  const tournamentTeams = teams.filter((team) => team.tournaments.includes(id));

  return (
    <Card className="overflow-hidden border-none shadow-elevated bg-gradient-to-br from-night-800 via-brand-800 to-brand-700 text-white relative group rounded-none">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-amber-400 opacity-10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>

      <CardContent className="p-8 md:p-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-white/10 text-emerald-300 border-white/10 hover:bg-white/20 transition-colors eyebrow px-3 py-1.5 text-[10px] backdrop-blur-md"
              >
                {tCommon("official")}
              </Badge>
              <Link
                href={`/t/${tournament.slug || id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t("publicLink")}
              </Link>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.95]">
                {tournament.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-emerald-50/80 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2 group/item">
                <div className="p-2 rounded-lg bg-white/10 border border-white/10 group-hover/item:bg-white/20 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{tournament.location}</span>
              </div>
              <div className="flex items-center gap-2 group/item">
                <div className="p-2 rounded-lg bg-white/10 border border-white/10 group-hover/item:bg-white/20 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>
                  {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                  {new Date(tournament.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 flex flex-col items-center justify-center min-w-[120px] shadow-2xl transition-all hover:bg-white/15">
              <div className="p-3 rounded-full bg-white/10 mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-4xl font-black leading-none mb-1 tabular-nums tracking-tight">
                {tournamentTeams.length}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                {tCommon("teams")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
