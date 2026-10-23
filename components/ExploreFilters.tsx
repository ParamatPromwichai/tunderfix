"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPicker } from "@/components/MapPicker";

export function ExploreFilters({
  categories,
  category,
  latitude,
  longitude,
  technicians,
  hasLocationParam
}: {
  categories: any[];
  category?: string;
  latitude: number;
  longitude: number;
  technicians: any[];
  hasLocationParam?: boolean;
}) {
  const router = useRouter();

  const handleSearch = (newCat: string, newLat: number, newLng: number) => {
    if (newCat === (category || "") && newLat === latitude && newLng === longitude) {
      return;
    }
    const params = new URLSearchParams();
    if (newCat) params.set("category", newCat);
    params.set("lat", newLat.toString());
    params.set("lng", newLng.toString());
    router.push(`/dashboard/customer/explore?${params.toString()}`);
  };

  useEffect(() => {
    if (hasLocationParam === false && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSearch(category || "", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, [hasLocationParam]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-stone-700 mb-1">หมวดหมู่งานซ่อม</label>
          <select 
            name="category" 
            value={category || ""} 
            onChange={(e) => handleSearch(e.target.value, latitude, longitude)}
            className="w-full h-11 rounded-lg border border-stone-300 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="">-- บริการทั้งหมด --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">ระบุตำแหน่งของคุณบนแผนที่</label>
        <MapPicker 
          initialLat={latitude} 
          initialLng={longitude} 
          nameLat="lat" 
          nameLng="lng" 
          technicians={technicians} 
          onPositionChange={(lat, lng) => handleSearch(category || "", lat, lng)}
        />
      </div>
    </div>
  );
}
