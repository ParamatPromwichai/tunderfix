import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export interface TechnicianService {
  id: string;
  technicianId: string;
  categoryId: string;
  priceMin: number | null;
  priceMax: number | null;
  experienceYears?: number | null;
  description?: string;
  categoryName?: string;
  createdAt: string;
}

type TechnicianServiceRow = RowDataPacket & {
  id: string;
  technician_id: string;
  category_id: string;
  price_min: string | null;
  price_max: string | null;
  experience_years?: number | null;
  description?: string;
  category_name?: string;
  created_at: string;
};

function mapRow(row: TechnicianServiceRow): TechnicianService {
  return {
    id: String(row.id),
    technicianId: String(row.technician_id),
    categoryId: String(row.category_id),
    priceMin: row.price_min ? parseFloat(row.price_min) : null,
    priceMax: row.price_max ? parseFloat(row.price_max) : null,
    experienceYears: row.experience_years !== undefined ? row.experience_years : null,
    description: row.description,
    categoryName: row.category_name,
    createdAt: row.created_at,
  };
}

export async function getServicesByTechnicianId(technicianId: string): Promise<TechnicianService[]> {
  const [rows] = await db.execute<TechnicianServiceRow[]>(
    `SELECT ts.*, c.name as category_name
     FROM technician_services ts
     JOIN service_categories c ON ts.category_id = c.id
     JOIN technician_profiles tp ON ts.technician_id = tp.id
     WHERE tp.user_id = ?`,
    [technicianId]
  );
  return rows.map(mapRow);
}

export async function addTechnicianService(input: {
  technicianId: string;
  categoryId: string;
  priceMin?: number;
  priceMax?: number;
  experienceYears?: number;
  description?: string;
}): Promise<string> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO technician_services (technician_id, category_id, price_min, price_max, experience_years, description)
     VALUES ((SELECT id FROM technician_profiles WHERE user_id = ?), ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       price_min = ?, 
       price_max = ?, 
       experience_years = ?,
       description = ?`,
    [
      input.technicianId, input.categoryId, input.priceMin ?? null, input.priceMax ?? null, input.experienceYears ?? null, input.description || null,
      input.priceMin ?? null, input.priceMax ?? null, input.experienceYears ?? null, input.description || null
    ]
  );
  return String(result.insertId);
}

export async function updateTechnicianService(id: string, technicianId: string, input: {
  priceMin?: number | null;
  priceMax?: number | null;
  experienceYears?: number | null;
  description?: string | null;
}): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE technician_services 
     SET price_min = ?, price_max = ?, experience_years = ?, description = ?
     WHERE id = ? AND technician_id = (SELECT id FROM technician_profiles WHERE user_id = ?)`,
    [
      input.priceMin !== undefined ? input.priceMin : null, 
      input.priceMax !== undefined ? input.priceMax : null, 
      input.experienceYears !== undefined ? input.experienceYears : null,
      input.description !== undefined ? input.description : null,
      id, technicianId
    ]
  );
  return result.affectedRows > 0;
}

export async function removeTechnicianService(id: string, technicianId: string): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `DELETE FROM technician_services WHERE id = ? AND technician_id = (SELECT id FROM technician_profiles WHERE user_id = ?)`,
    [id, technicianId]
  );
  return result.affectedRows > 0;
}
