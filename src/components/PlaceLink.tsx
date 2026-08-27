"use client";

import { Place } from "@/modules/places/domain/place";
import { MapPin, ExternalLink } from "lucide-react";
import { getGoogleMapsUrl } from "@/lib/places";
import { useTranslations } from "next-intl";

interface PlaceLinkProps {
  place: Place | null;
  className?: string;
}

export function PlaceLink({ place, className }: PlaceLinkProps) {
  const t = useTranslations("Common");
  if (!place) return null;

  const mapsUrl = getGoogleMapsUrl(place);

  return (
    <div className={`flex items-center gap-1.5 ${className || ""}`}>
      <MapPin className="h-3 w-3 text-brand-500 flex-shrink-0" />
      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-brand-600 transition-colors flex items-center gap-1"
        >
          {place.name}
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      ) : (
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {place.name}
        </span>
      )}
    </div>
  );
}
