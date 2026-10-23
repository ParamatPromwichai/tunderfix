import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export interface TechnicianExploreResult {
  id: string; // technician_profiles.id
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  yearsExperience: number;
  averageRating: number;
  totalReviews: number;
  distanceKm: number;
  latitude: number | null;
  longitude: number | null;
  priceMin: number | null;
  priceMax: number | null;
  serviceDescription: string | null;
  categoryName: string;
  categoryId: string;
}

export async function searchTechnicians(
  lat: number,
  lng: number,
  categoryId?: string,
  search?: string,
): Promise<TechnicianExploreResult[]> {
  let query = `
    SELECT tp.id, tp.user_id, u.full_name, u.avatar_url, tp.bio, tp.years_experience,
           tp.average_rating, tp.total_reviews, tp.service_radius_km, tp.latitude, tp.longitude,
           ts.id as ts_id, ts.price_min, ts.price_max, ts.category_id,
           ts.experience_years as service_experience_years,
           ts.description as service_description,
           c.name as category_name,
           ( 6371 * acos( cos( radians(?) ) * cos( radians( tp.latitude ) ) 
           * cos( radians( tp.longitude ) - radians(?) ) + sin( radians(?) ) 
           * sin( radians( tp.latitude ) ) ) ) AS distance
    FROM technician_profiles tp
    JOIN users u ON tp.user_id = u.id
    JOIN technician_services ts ON ts.technician_id = tp.id
    JOIN service_categories c ON ts.category_id = c.id
  `;

  const params: any[] = [lat, lng, lat];

  if (categoryId) {
    query += ` WHERE tp.is_available = TRUE AND ts.category_id = ? `;
    params.push(categoryId);
  } else {
    query += ` WHERE tp.is_available = TRUE `;
  }

  if (search?.trim()) {
    const term = search
      .trim()
      .slice(0, 100)
      .replace(/^(ล้าง|ติดตั้ง|ซ่อม|ระบบ)/, "");
    query += ` AND (c.name LIKE ? OR ts.description LIKE ? OR u.full_name LIKE ?) `;
    params.push(`%${term}%`, `%${term}%`, `%${term}%`);
  }
  query += ` AND u.status = 'active' AND c.is_active = 1
    GROUP BY ts.id
    HAVING distance <= tp.service_radius_km
    ORDER BY distance ASC
  `;

  const [rows] = await db.execute<RowDataPacket[]>(query, params);

  return rows.map((row) => ({
    id: String(row.ts_id), // Use ts_id so each card has a unique key
    userId: String(row.user_id),
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    yearsExperience:
      row.service_experience_years != null
        ? row.service_experience_years
        : row.years_experience,
    averageRating: parseFloat(row.average_rating),
    totalReviews: row.total_reviews,
    distanceKm: parseFloat(row.distance),
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    priceMin: row.price_min ? parseFloat(row.price_min) : null,
    priceMax: row.price_max ? parseFloat(row.price_max) : null,
    serviceDescription: row.service_description || null,
    categoryName: row.category_name,
    categoryId: String(row.category_id),
  }));
}
