import { z } from "zod";

export const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});
export const urgentJobSchema = coordinatesSchema.extend({
  categoryId: z.string().regex(/^\d+$/),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(3000),
  addressText: z.string().trim().min(5).max(1000),
  radiusKm: z.number().int().min(1).max(50),
  budgetMax: z.number().finite().positive().max(1000000).optional(),
});
export const offerSchema = z.object({
  jobId: z.string().regex(/^\d+$/),
  price: z.number().finite().positive().max(1000000),
  etaMinutes: z.number().int().min(5).max(240),
  note: z.string().trim().max(500),
});
export type UrgentJobInput = z.infer<typeof urgentJobSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type DispatchOffer = {
  id: string;
  technicianId: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  etaMinutes: number;
  note: string;
};
export type DispatchJob = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  status: string;
  radiusKm: number;
  expiresAt: string;
  distanceKm: number | null;
  budgetMax: number | null;
  offers: DispatchOffer[];
  hasOffered?: boolean;
};
export type MyDispatchOffer = {
  jobId: string;
  title: string;
  status: string;
  selected: boolean;
  price: number;
  expiresAt: string;
};
export type DispatchSnapshot = {
  jobs: DispatchJob[];
  myOffers: MyDispatchOffer[];
  online: boolean;
  location: { latitude: number; longitude: number } | null;
};

export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude),
    dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
