"use client";
import { useState } from "react";
import { createApiPlaceRepository } from "../modules/places/infrastructure/api-place-repository";
import { LocationPicker } from "./LocationPicker";
import { useTranslations } from "next-intl";

export const CreatePlaceForm = ({
  onPlaceCreated,
  tournamentId,
}: {
  onPlaceCreated: () => void;
  tournamentId: string;
}) => {
  const t = useTranslations("CreatePlaceForm");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [capacity, setCapacity] = useState("");
  const repository = createApiPlaceRepository();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await repository.save({
        name,
        tournamentId,
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        latitude,
        longitude,
      });

      setName("");
      setLocation("");
      setLatitude(undefined);
      setLongitude(undefined);
      setCapacity("");
      onPlaceCreated();
    } catch (error) {
      console.error("Failed to create place", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-sm border border-gray-200 rounded-xl"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-900">{t("title")}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("name")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder={t("namePlaceholder")}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder={t("capacityPlaceholder")}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t("save")}
        </button>
      </div>
    </form>
  );
};
