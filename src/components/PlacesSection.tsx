"use client";

import { useState } from "react";
import { PlacesList } from "./PlacesList";
import { CreatePlaceForm } from "./CreatePlaceForm";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { MapPin, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export const PlacesSection = ({ tournamentId }: { tournamentId: string }) => {
  const t = useTranslations("Places");
  const { tournaments } = useTournamentContext();
  const { user, isAuthenticated } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tournament = tournaments.find((t) => t.id === tournamentId);
  const isOwner = tournament?.ownerId === user?.id;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage = isAuthenticated && (isSuperAdmin || isOwner);

  return (
    <section className="mt-8 mb-12 space-y-8">
      <header className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <h2 className="display-title text-2xl text-foreground">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {canManage && (
          <Card className="overflow-hidden border-border shadow-card rounded-2xl">
            <CardHeader className="bg-neutral-50/50 px-6 py-4 border-b border-border flex flex-row items-center gap-2">
              <Plus className="h-4 w-4 text-brand-600" />
              <CardTitle className="eyebrow text-muted-foreground">
                {t("register")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CreatePlaceForm
                onPlaceCreated={() => setRefreshTrigger((prev) => prev + 1)}
                tournamentId={tournamentId}
              />
            </CardContent>
          </Card>
        )}
        <div className={canManage ? "" : "lg:col-span-2"}>
          <PlacesList
            refreshTrigger={refreshTrigger}
            tournamentId={tournamentId}
          />
        </div>
      </div>
    </section>
  );
};
