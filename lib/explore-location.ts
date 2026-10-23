export type ExplorePin = { latitude: number; longitude: number };

export function parseExplorePin(
  latitude: unknown,
  longitude: unknown,
): ExplorePin | null {
  const number = (value: unknown) =>
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;
  const lat = number(latitude);
  const lng = number(longitude);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? { latitude: lat, longitude: lng }
    : null;
}

export function explorePinKey(userId: string) {
  return `thunderfix:explore-pin:v1:${userId}`;
}

export function decodeExplorePin(value: string | null): ExplorePin | null {
  try {
    const saved: unknown = JSON.parse(value || "null");
    if (
      !saved ||
      typeof saved !== "object" ||
      !("version" in saved) ||
      saved.version !== 1 ||
      !("latitude" in saved) ||
      typeof saved.latitude !== "number" ||
      !("longitude" in saved) ||
      typeof saved.longitude !== "number"
    )
      return null;
    return parseExplorePin(saved.latitude, saved.longitude);
  } catch {
    return null;
  }
}

export function saveExplorePin(
  storage: Pick<Storage, "setItem">,
  key: string,
  pin: ExplorePin,
): boolean {
  try {
    storage.setItem(key, JSON.stringify({ version: 1, ...pin }));
    return true;
  } catch {
    return false;
  }
}

export function exploreUrl(category: string, pin?: ExplorePin, query?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (pin) {
    params.set("lat", String(pin.latitude));
    params.set("lng", String(pin.longitude));
  }
  return `/dashboard/customer/explore${params.size ? `?${params.toString()}` : ""}`;
}
