import { Place } from "@/modules/places/domain/place";

export function getPlaceName(
  placeId: string | undefined,
  places: Place[],
): string | null {
  if (!placeId) return null;
  return places.find((p) => p.id === placeId)?.name || null;
}

export function getPlace(
  placeId: string | undefined,
  places: Place[],
): Place | null {
  if (!placeId) return null;
  return places.find((p) => p.id === placeId) || null;
}

export function getGoogleMapsUrl(place: Place): string | null {
  if (place.latitude != null && place.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  }
  if (place.location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location)}`;
  }
  return null;
}
