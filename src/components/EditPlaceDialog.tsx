"use client";

import { useState, useEffect } from "react";
import { Place } from "@/modules/places/domain/place";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { LocationPicker } from "./LocationPicker";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditPlaceDialogProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditPlaceDialog({
  place,
  open,
  onOpenChange,
  onSaved,
}: EditPlaceDialogProps) {
  const t = useTranslations("EditPlace");
  const { updatePlace } = useTournamentContext();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (place) {
      setName(place.name || "");
      setLocation(place.location || "");
      setLatitude(place.latitude);
      setLongitude(place.longitude);
      setCapacity(place.capacity?.toString() || "");
    }
  }, [place]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!place) return;
    setSaving(true);
    try {
      await updatePlace(place.id, {
        name,
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        latitude,
        longitude,
      });
      notify.success(t("saved"));
      onOpenChange(false);
      onSaved();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&_.leaflet-container]:z-0">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("location")}
            </label>
            <LocationPicker
              value={location}
              latitude={latitude}
              longitude={longitude}
              onChange={(data) => {
                setLocation(data.location);
                setLatitude(data.latitude);
                setLongitude(data.longitude);
              }}
              placeholder={t("locationPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("capacity")}
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder={t("capacityPlaceholder")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
