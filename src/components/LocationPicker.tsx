"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin } from "lucide-react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationPickerProps {
  value: string;
  latitude?: number;
  longitude?: number;
  onChange: (data: {
    location: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  placeholder?: string;
}

const markerIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#2563eb;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "User-Agent": "TournamentManager/1.0" } },
    );
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

export function LocationPicker({
  value,
  latitude,
  longitude,
  onChange,
  placeholder = "Buscar dirección...",
}: LocationPickerProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const hasCoords = latitude != null && longitude != null;
  const center: [number, number] = hasCoords
    ? [latitude!, longitude!]
    : [40.4168, -3.7038];
  const markerPosition: [number, number] | null = hasCoords
    ? [latitude!, longitude!]
    : null;

  const searchNominatim = useCallback(
    async (q: string, selectFirst = false) => {
      if (q.length < 3) {
        setSuggestions([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
          { headers: { "User-Agent": "TournamentManager/1.0" } },
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
        if (selectFirst && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          setQuery(first.display_name);
          setShowSuggestions(false);
          setSuggestions([]);
          onChange({
            location: first.display_name,
            latitude: lat,
            longitude: lng,
          });
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange({ location: val });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchNominatim(val), 300);
  };

  const handleSearchClick = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchNominatim(query, true);
  };

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setQuery(result.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    onChange({ location: result.display_name, latitude: lat, longitude: lng });
  };

  const placePin = useCallback(
    async (lat: number, lng: number) => {
      const address = await reverseGeocode(lat, lng);
      setQuery(address || "");
      onChange({ location: address || "", latitude: lat, longitude: lng });
    },
    [onChange],
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      placePin(lat, lng);
    },
    [placePin],
  );

  const handleMarkerDragEnd = useCallback(
    (lat: number, lng: number) => {
      placePin(lat, lng);
    },
    [placePin],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      <div ref={wrapperRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() =>
                suggestions.length > 0 && setShowSuggestions(true)
              }
              placeholder={placeholder}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={searching || query.length < 3}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            {searching ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((s) => (
              <li key={s.place_id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-start gap-2 transition-colors"
                  onClick={() => handleSelect(s)}
                >
                  <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{s.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="rounded-lg overflow-hidden border border-gray-200"
        style={{ height: 240 }}
      >
        <MapContainer
          center={center}
          zoom={hasCoords ? 15 : 5}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          <FlyToPosition position={markerPosition} />
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={markerIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e: L.LeafletEvent) => {
                  const { lat, lng } = (
                    e.target as L.Marker
                  ).getLatLng();
                  handleMarkerDragEnd(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {hasCoords && (
        <p className="text-xs text-muted-foreground">
          {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
        </p>
      )}
    </div>
  );
}
