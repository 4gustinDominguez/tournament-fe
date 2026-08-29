"use client";

import { useEffect, useState } from "react";
import { createApiPlaceRepository } from "../modules/places/infrastructure/api-place-repository";
import { Place } from "../modules/places/domain/place";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Building2,
  Trash2,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";
import { EditPlaceDialog } from "./EditPlaceDialog";
import { PlaceMap } from "./PlaceMap";

export const PlacesList = ({
  refreshTrigger,
  tournamentId,
}: {
  refreshTrigger: number;
  tournamentId: string;
}) => {
  const t = useTranslations("Places");
  const tCommon = useTranslations("Common");
  const { deletePlace, tournaments } = useTournamentContext();
  const { user, isAuthenticated } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  useEffect(() => {
    const repository = createApiPlaceRepository();
    setLoading(true);
    repository
      .getAll(tournamentId)
      .then(setPlaces)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger, tournamentId]);

  const tournament = tournaments.find((t) => t.id === tournamentId);
  const canManage =
    isAuthenticated &&
    (user?.role === UserRole.SUPER_ADMIN || tournament?.ownerId === user?.id);

  const handleDeletePlace = async (placeId: string) => {
    if (confirm(t("deleteConfirm"))) {
      try {
        await deletePlace({ placeId, tournamentId });
        notify.success(t("deleteSuccess"));
        const repository = createApiPlaceRepository();
        const updated = await repository.getAll(tournamentId);
        setPlaces(updated);
      } catch (error: any) {
        notify.error(error?.message || t("deleteError"));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 flex-1 min-w-0 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <Card className="bg-muted/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
            <Building2 className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-bold text-gray-700">{t("emptyTitle")}</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto italic">
              {t("emptyText")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 pb-2">
      {places.map((place) => (
        <Card
          key={place.id}
          className="group flex-1 min-w-0 overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {place.name}
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {place.latitude != null && place.longitude != null && (
              <div
                className="rounded-lg overflow-hidden border border-gray-100"
                style={{ height: 140 }}
              >
                <PlaceMap
                  latitude={place.latitude}
                  longitude={place.longitude}
                />
              </div>
            )}
            <div className="space-y-3">
              {place.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium ">{place.location}</span>
                </div>
              )}
              {place.capacity && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-medium">
                    {t("spectators", {
                      count: place.capacity.toLocaleString(),
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-0 flex-col items-stretch border-t border-gray-50 bg-gray-50/30 rounded-b-xl px-6 py-3 gap-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="bg-white border-gray-100 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {t("officialVenue")}
              </Badge>
              {(place.location ||
                (place.latitude != null && place.longitude != null)) && (
                <a
                  href={
                    place.latitude != null && place.longitude != null
                      ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location || "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-3 w-3" /> {t("getDirections")}
                </a>
              )}
            </div>
            {canManage && (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPlace(place)}
                  className="h-8 font-bold text-[10px] tracking-wider uppercase hover:bg-brand-50 hover:text-brand-600"
                >
                  <Pencil className="h-3 w-3 mr-1" /> {tCommon("edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePlace(place.id)}
                  className="h-8 text-destructive font-bold text-[10px] tracking-wider uppercase hover:text-destructive hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> {tCommon("delete")}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}

      <EditPlaceDialog
        place={editingPlace}
        open={editingPlace !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPlace(null);
        }}
        onSaved={() => {
          setEditingPlace(null);
          const repository = createApiPlaceRepository();
          repository.getAll(tournamentId).then(setPlaces).catch(console.error);
        }}
      />
    </div>
  );
};
