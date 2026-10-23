"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPicker } from "@/components/MapPicker";
import { CategoryRail } from "@/components/CategoryRail";
import { Check, LoaderCircle, MapPin } from "lucide-react";
import {
  decodeExplorePin,
  explorePinKey,
  exploreUrl,
  saveExplorePin,
  type ExplorePin,
} from "@/lib/explore-location";
import type { TechnicianExploreResult } from "@/repositories/technicians-explore.repository";

export function ExploreFilters({
  categories,
  category,
  latitude,
  longitude,
  technicians,
  hasLocationParam,
  userId,
}: {
  categories: { id: string; name: string }[];
  category?: string;
  latitude: number;
  longitude: number;
  technicians: TechnicianExploreResult[];
  hasLocationParam: boolean;
  userId: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") || "";
  const [pending, startTransition] = useTransition();
  const [pin, setPin] = useState<ExplorePin>({ latitude, longitude });
  const [selected, setSelected] = useState(category || "");
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const manualPin = useRef(false);
  const confirmedPin = useRef(hasLocationParam);
  const key = explorePinKey(userId);
  const remember = useCallback(
    (next: ExplorePin) => {
      try {
        setSaved(saveExplorePin(localStorage, key, next));
      } catch {
        setSaved(false);
      }
    },
    [key],
  );
  function navigate(nextCategory: string, nextPin: ExplorePin) {
    if (
      nextCategory === (category || "") &&
      nextPin.latitude === latitude &&
      nextPin.longitude === longitude &&
      hasLocationParam &&
      !params.has("q")
    )
      return;
    startTransition(() =>
      router.push(
        exploreUrl(nextCategory, confirmedPin.current ? nextPin : undefined),
        { scroll: false },
      ),
    );
  }
  useEffect(() => {
    setSelected(category || "");
  }, [category]);

  useEffect(() => {
    let cancelled = false;
    if (hasLocationParam) {
      confirmedPin.current = true;
      const next = { latitude, longitude };
      setPin(next);
      remember(next);
      setLocating(false);
      return;
    }
    let previous: ExplorePin | null = null;
    try {
      previous = decodeExplorePin(localStorage.getItem(key));
    } catch {
      /* The URL and map remain usable when storage is unavailable. */
    }
    if (previous) {
      confirmedPin.current = true;
      setPin(previous);
      setSaved(true);
      startTransition(() =>
        router.replace(exploreUrl(category || "", previous, query), {
          scroll: false,
        }),
      );
      return;
    }
    if ("geolocation" in navigator && !manualPin.current) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled || manualPin.current) return;
          const next = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          confirmedPin.current = true;
          setPin(next);
          setLocating(false);
          remember(next);
          startTransition(() =>
            router.replace(exploreUrl(category || "", next, query), {
              scroll: false,
            }),
          );
        },
        () => {
          if (!cancelled) setLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    }
    return () => {
      cancelled = true;
    };
  }, [
    category,
    hasLocationParam,
    latitude,
    longitude,
    key,
    router,
    query,
    remember,
  ]);

  return (
    <div className="explore-filters" aria-busy={pending}>
      <CategoryRail
        categories={categories}
        selected={selected}
        onSelect={(next) => {
          setSelected(next);
          navigate(next, pin);
        }}
      />
      <div className="explore-map-section">
        <div className="explore-map-heading">
          <h2>
            <MapPin size={18} /> พื้นที่ที่ต้องการหาช่าง
          </h2>
          <span className="explore-pin-status">
            {locating ? (
              <>
                <LoaderCircle size={14} className="spin" /> กำลังระบุตำแหน่ง
              </>
            ) : saved ? (
              <>
                <Check size={14} /> จำหมุดแล้ว
              </>
            ) : (
              "ปักหมุดบนแผนที่"
            )}
          </span>
        </div>
        <MapPicker
          initialLat={pin.latitude}
          initialLng={pin.longitude}
          nameLat="lat"
          nameLng="lng"
          technicians={technicians}
          onPositionChange={(lat, lng) => {
            const next = { latitude: lat, longitude: lng };
            manualPin.current = true;
            confirmedPin.current = true;
            setLocating(false);
            setPin(next);
            remember(next);
            navigate(selected, next);
          }}
        />
      </div>
      <span className="sr-only" role="status">
        {pending ? "กำลังอัปเดตช่างในพื้นที่" : "อัปเดตรายการช่างแล้ว"}
      </span>
    </div>
  );
}
