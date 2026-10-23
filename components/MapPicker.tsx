"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const MapPickerImpl = dynamic(() => import("./MapPickerImpl"), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-stone-100 rounded-lg animate-pulse flex items-center justify-center text-stone-500 border border-stone-200">กำลังโหลดแผนที่...</div>
});

export function MapPicker({ 
  initialLat = 13.7563, 
  initialLng = 100.5018,
  nameLat = "latitude",
  nameLng = "longitude",
  technicians,
  onPositionChange
}: { 
  initialLat?: number;
  initialLng?: number;
  nameLat?: string;
  nameLng?: string;
  technicians?: any[];
  onPositionChange?: (lat: number, lng: number) => void;
}) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);

  useEffect(() => {
    setLat(initialLat);
    setLng(initialLng);
  }, [initialLat, initialLng]);

  return (
    <div>
      <input type="hidden" name={nameLat} value={lat} />
      <input type="hidden" name={nameLng} value={lng} />
      <MapPickerImpl 
        initialLat={lat} 
        initialLng={lng} 
        technicians={technicians}
        onChange={(newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
          onPositionChange?.(newLat, newLng);
        }} 
      />
      <p className="text-xs text-stone-500 mt-2">คลิกบนแผนที่เพื่อปักหมุดตำแหน่งของคุณ</p>
    </div>
  );
}
