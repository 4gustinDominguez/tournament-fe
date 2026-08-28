"use client";

import dynamic from "next/dynamic";

const PlaceMapInner = dynamic(() => import("./PlaceMapInner"), { ssr: false });

interface PlaceMapProps {
  latitude: number;
  longitude: number;
}

export function PlaceMap({ latitude, longitude }: PlaceMapProps) {
  return <PlaceMapInner latitude={latitude} longitude={longitude} />;
}
