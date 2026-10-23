import { executeInsert } from "@/lib/database-insert";
import { type RowDataPacket } from "mysql2";

import { db } from "@/lib/db";

export type AccountStatus = "active" | "suspended";
export type AuthUserRole = "customer" | "technician" | "admin";

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: AuthUserRole;
  status: AccountStatus;
  avatarUrl: string | null;
}

export interface CreateUserRecord {
  fullName: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: "customer" | "technician";
  technicianProfile?: {
    bio: string | null;
    yearsExperience: number;
    latitude: number;
    longitude: number;
    serviceRadiusKm: number;
  };
}

type UserRow = RowDataPacket & {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: AuthUserRole;
  status: AccountStatus;
  avatar_url: string | null;
};

export class DuplicateEmailError extends Error {
  constructor() {
    super("Email is already registered");
    this.name = "DuplicateEmailError";
  }
}

function mapUserRow(row: UserRow): UserRecord {
  return {
    id: String(row.id),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    avatarUrl: row.avatar_url,
  };
}

export async function findUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const [rows] = await db.execute<UserRow[]>(
    `SELECT id, full_name, email, phone, password_hash, role, status, avatar_url
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  return rows[0] ? mapUserRow(rows[0]) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const [rows] = await db.execute<UserRow[]>(
    `SELECT id, full_name, email, phone, password_hash, role, status, avatar_url
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] ? mapUserRow(rows[0]) : null;
}

function isDuplicateEntryError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

export async function createUser(input: CreateUserRecord): Promise<UserRecord> {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [userResult] = await executeInsert(
      connection,
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.fullName,
        input.email,
        input.phone,
        input.passwordHash,
        input.role,
      ],
    );

    const userId = String(userResult.insertId);

    if (input.role === "technician" && input.technicianProfile) {
      await executeInsert(
        connection,
        `INSERT INTO technician_profiles
          (user_id, bio, years_experience, latitude, longitude, service_radius_km)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          input.technicianProfile.bio,
          input.technicianProfile.yearsExperience,
          input.technicianProfile.latitude,
          input.technicianProfile.longitude,
          input.technicianProfile.serviceRadiusKm,
        ],
      );
    }

    await connection.commit();

    return {
      id: userId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      role: input.role,
      status: "active",
      avatarUrl: null,
    };
  } catch (error) {
    await connection.rollback();

    if (isDuplicateEntryError(error)) {
      throw new DuplicateEmailError();
    }

    throw error;
  } finally {
    connection.release();
  }
}
