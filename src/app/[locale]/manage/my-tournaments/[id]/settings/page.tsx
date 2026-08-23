"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Tournament } from "@/modules/tournament/domain/tournament";
import { notify } from "@/lib/notify";
import { Settings2, Loader2 } from "lucide-react";

export default function TournamentSettingsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const t = useTranslations("TournamentSettings");
  const router = useRouter();
  const { getTournamentById, updateTournament } = useTournamentContext();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [matchDurationMinutes, setMatchDurationMinutes] = useState<string>("");

  useEffect(() => {
    async function load() {
      const found = await getTournamentById(params.id);
      if (!found) {
        notify.error("Torneo no encontrado");
        router.push("/manage/my-tournaments");
        return;
      }
      setTournament(found);
      setName(found.name || "");
      setLocation(found.location || "");
      const start = found.startDate ? new Date(found.startDate) : null;
      const end = found.endDate ? new Date(found.endDate) : null;
      setStartDate(start ? start.toISOString().split("T")[0] : "");
      setEndDate(end ? end.toISOString().split("T")[0] : "");
      setMatchDurationMinutes(found.matchDurationMinutes?.toString() || "");
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;
    setSaving(true);
    try {
      await updateTournament({
        ...tournament,
        name,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        matchDurationMinutes: matchDurationMinutes ? parseInt(matchDurationMinutes) : undefined,
      });
      notify.success(t("saved"));
      router.push(`/manage/my-tournaments/${params.id}`);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <button
        type="button"
        onClick={() => router.push(`/manage/my-tournaments/${params.id}`)}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">{t("name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-input rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1">{t("location")}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border border-input rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("startDate")}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                required
                className="w-full p-3 border border-input rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("endDate")}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                required
                className="w-full p-3 border border-input rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1">{t("matchDuration")}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="600"
                value={matchDurationMinutes}
                onChange={(e) => setMatchDurationMinutes(e.target.value)}
                placeholder={t("matchDurationPlaceholder")}
                className="w-full p-3 border border-input rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none"
              />
              <span className="text-sm text-muted-foreground flex-shrink-0">{t("minutes")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("matchDurationHelp")}</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? t("saving") : t("save")}
          </button>
        </form>
      </div>
    </div>
  );
}
