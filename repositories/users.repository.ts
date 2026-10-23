import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function getUserProfile(userId: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT u.id, u.full_name, u.phone, u.latitude, u.longitude, u.address_text, u.avatar_url, tp.bio, tp.years_experience, tp.service_radius_km
     FROM users u
     LEFT JOIN technician_profiles tp ON u.id = tp.user_id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );
  if (!rows[0]) return null;
  return {
    id: String(rows[0].id),
    fullName: rows[0].full_name,
    phone: rows[0].phone,
    avatarUrl: rows[0].avatar_url,
    latitude: rows[0].latitude ? parseFloat(rows[0].latitude) : null,
    longitude: rows[0].longitude ? parseFloat(rows[0].longitude) : null,
    addressText: rows[0].address_text,
    bio: rows[0].bio,
    yearsExperience: rows[0].years_experience,
    serviceRadiusKm: rows[0].service_radius_km ? parseFloat(rows[0].service_radius_km) : null,
  };
}

export async function updateUserProfile(userId: string, data: {
  fullName: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  addressText: string;
  avatarUrl?: string | null;
}) {
  let query = `UPDATE users SET full_name = ?, phone = ?, latitude = ?, longitude = ?, address_text = ?`;
  let params: any[] = [data.fullName, data.phone, data.latitude, data.longitude, data.addressText];
  
  if (data.avatarUrl !== undefined) {
    query += `, avatar_url = ?`;
    params.push(data.avatarUrl);
  }
  
  query += ` WHERE id = ?`;
  params.push(userId);

  const [result] = await db.execute<ResultSetHeader>(query, params);
  
  if (data.latitude != null && data.longitude != null) {
    await db.execute(
      `UPDATE technician_profiles SET latitude = ?, longitude = ? WHERE user_id = ?`,
      [data.latitude, data.longitude, userId]
    );
  }
  return result.affectedRows > 0;
}

export async function updateTechnicianProfile(userId: string, data: {
  bio: string;
  yearsExperience: number;
  serviceRadiusKm: number;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE technician_profiles 
     SET bio = ?, years_experience = ?, service_radius_km = ?, latitude = (SELECT latitude FROM users WHERE id = ?), longitude = (SELECT longitude FROM users WHERE id = ?)
     WHERE user_id = ?`,
    [data.bio, data.yearsExperience, data.serviceRadiusKm, userId, userId, userId]
  );
  return result.affectedRows > 0;
}
