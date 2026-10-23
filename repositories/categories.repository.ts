import { type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

type ServiceCategoryRow = RowDataPacket & {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

function mapRow(row: ServiceCategoryRow): ServiceCategory {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

export async function getAllCategories(): Promise<ServiceCategory[]> {
  const [rows] = await db.execute<ServiceCategoryRow[]>(
    `SELECT id, name, description, is_active, created_at
     FROM service_categories
     WHERE is_active = TRUE
     ORDER BY name ASC`
  );
  return rows.map(mapRow);
}

export async function getCategoryById(id: string): Promise<ServiceCategory | null> {
  const [rows] = await db.execute<ServiceCategoryRow[]>(
    `SELECT id, name, description, is_active, created_at
     FROM service_categories
     WHERE id = ?`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createCategory(name: string, description?: string): Promise<string> {
  const [result] = await db.execute<import("mysql2").ResultSetHeader>(
    `INSERT INTO service_categories (name, description, is_active)
     VALUES (?, ?, TRUE)`,
    [name, description || null]
  );
  return String(result.insertId);
}
