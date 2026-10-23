import { type RowDataPacket } from "mysql2";

import { db } from "@/lib/db";

export interface HomeCategoryRecord {
  id: string;
  name: string;
  description: string | null;
  totalJobs: number;
}

export interface HomeTechnicianRecord {
  id: string;
  name: string;
  skill: string;
  yearsExperience: number;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface HomeJobRecord {
  id: string;
  title: string;
  area: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  categoryName: string;
}

export interface HomeStatsRecord {
  totalJobs: number;
  completedJobs: number;
  technicianCount: number;
  openJobs: number;
}

type CategoryRow = RowDataPacket & {
  id: string;
  name: string;
  description: string | null;
  total_jobs: number | string;
};

type TechnicianRow = RowDataPacket & {
  id: string;
  full_name: string;
  service_names: string | null;
  years_experience: number;
  is_available: number | boolean;
  average_rating: number | string;
  total_reviews: number;
  min_price: number | string | null;
  max_price: number | string | null;
};

type JobRow = RowDataPacket & {
  id: string;
  title: string;
  address_text: string;
  status: string;
  budget_min: number | string | null;
  budget_max: number | string | null;
  category_name: string;
};

type StatsRow = RowDataPacket & {
  total_jobs: number | string;
  completed_jobs: number | string;
  technician_count: number | string;
  open_jobs: number | string;
};

function toNumber(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getArea(address: string): string {
  return address.split(",")[0]?.trim() || address.slice(0, 48) || "ไม่ระบุพื้นที่";
}

export async function findHomeCategories(): Promise<HomeCategoryRecord[]> {
  const [rows] = await db.execute<CategoryRow[]>(
    `SELECT
        sc.id,
        sc.name,
        sc.description,
        COUNT(j.id) AS total_jobs
      FROM service_categories sc
      LEFT JOIN jobs j ON j.category_id = sc.id
      WHERE sc.is_active = TRUE
      GROUP BY sc.id, sc.name, sc.description
      ORDER BY total_jobs DESC, sc.name ASC
      LIMIT 4`,
  );

  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    description: row.description,
    totalJobs: Number(row.total_jobs) || 0,
  }));
}

export async function findRecommendedTechnicians(): Promise<
  HomeTechnicianRecord[]
> {
  const [rows] = await db.execute<TechnicianRow[]>(
    `SELECT
        u.id,
        u.full_name,
        COALESCE(GROUP_CONCAT(DISTINCT sc.name ORDER BY sc.name SEPARATOR ', '), 'งานซ่อมทั่วไป') AS service_names,
        tp.years_experience,
        tp.is_available,
        tp.average_rating,
        tp.total_reviews,
        MIN(ts.price_min) AS min_price,
        MAX(ts.price_max) AS max_price
      FROM technician_profiles tp
      INNER JOIN users u ON u.id = tp.user_id
      LEFT JOIN technician_services ts ON ts.technician_id = tp.id
      LEFT JOIN service_categories sc ON sc.id = ts.category_id
      WHERE u.status = 'active'
      GROUP BY
        u.id,
        u.full_name,
        tp.years_experience,
        tp.is_available,
        tp.average_rating,
        tp.total_reviews,
        tp.verification_status
      ORDER BY
        tp.verification_status = 'approved' DESC,
        tp.is_available DESC,
        tp.average_rating DESC,
        tp.total_reviews DESC
      LIMIT 3`,
  );

  return rows.map((row) => ({
    id: String(row.id),
    name: row.full_name,
    skill: row.service_names || "งานซ่อมทั่วไป",
    yearsExperience: row.years_experience,
    isAvailable: Boolean(row.is_available),
    rating: toNumber(row.average_rating) ?? 0,
    totalReviews: row.total_reviews,
    minPrice: toNumber(row.min_price),
    maxPrice: toNumber(row.max_price),
  }));
}

export async function findRecentJobs(): Promise<HomeJobRecord[]> {
  const [rows] = await db.execute<JobRow[]>(
    `SELECT
        j.id,
        j.title,
        j.address_text,
        j.status,
        j.budget_min,
        j.budget_max,
        sc.name AS category_name
      FROM jobs j
      INNER JOIN service_categories sc ON sc.id = j.category_id
      ORDER BY j.created_at DESC
      LIMIT 3`,
  );

  return rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    area: getArea(row.address_text),
    status: row.status,
    budgetMin: toNumber(row.budget_min),
    budgetMax: toNumber(row.budget_max),
    categoryName: row.category_name,
  }));
}

export async function getHomeStats(): Promise<HomeStatsRecord> {
  const [rows] = await db.execute<StatsRow[]>(
    `SELECT
        (SELECT COUNT(*) FROM jobs) AS total_jobs,
        (SELECT COUNT(*) FROM jobs WHERE status = 'completed') AS completed_jobs,
        (SELECT COUNT(*) FROM technician_profiles tp
          INNER JOIN users u ON u.id = tp.user_id
          WHERE u.status = 'active') AS technician_count,
        (SELECT COUNT(*) FROM jobs WHERE status IN ('requested', 'accepted', 'on_the_way', 'in_progress')) AS open_jobs`,
  );

  const row = rows[0];

  return {
    totalJobs: Number(row?.total_jobs) || 0,
    completedJobs: Number(row?.completed_jobs) || 0,
    technicianCount: Number(row?.technician_count) || 0,
    openJobs: Number(row?.open_jobs) || 0,
  };
}
