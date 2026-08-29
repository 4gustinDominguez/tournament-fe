"use client";

import { useState } from "react";

import { useRouter } from "@/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";

const CONSEQUENCES = ["matches", "rounds", "teams", "players", "places"] as const;

export function DangerZone({ tournamentId }: { tournamentId: string }) {
  const t = useTranslations("TournamentDetail");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const { tournaments, deleteTournament } = useTournamentContext();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tournament = tournaments.find((t) => t.id === tournamentId);
  const isOwner = tournament?.ownerId === user?.id;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage = isAuthenticated && (isSuperAdmin || isOwner);

  if (!canManage) {
    return null;
  }

  const allChecked = CONSEQUENCES.every((key) => checked.includes(key));

  const toggle = (key: string) => {
    setChecked((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTournament(tournamentId);
      router.push("/manage/my-tournaments");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("dangerZone.deleteError"));
      setIsDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/50 overflow-hidden shadow-card">
      <div className="px-6 py-4 border-b border-red-200 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="display-title text-xl text-red-700">{t("dangerZone.title")}</h3>
      </div>

      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <p className="text-sm text-muted-foreground max-w-lg">
          {t("dangerZone.description")}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="shrink-0 rounded-xl"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {t("dangerZone.deleteButton")}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("dangerZone.modalTitle")}</DialogTitle>
              <DialogDescription>
                {t("dangerZone.modalDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {CONSEQUENCES.map((key) => (
                <label
                  key={key}
                  className="flex items-start gap-3 rounded-lg border border-border bg-white px-4 py-3 cursor-pointer hover:border-red-200 transition-colors"
                >
                  <Checkbox
                    checked={checked.includes(key)}
                    onCheckedChange={() => toggle(key)}
                    className="mt-0.5"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {t(`dangerZone.checks.${key}`)}
                  </span>
                </label>
              ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!allChecked || isDeleting}
              >
                {isDeleting ? tCommon("loading") : t("dangerZone.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
