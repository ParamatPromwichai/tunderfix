import { z } from "zod";

export const userRoleSchema = z.enum(["customer", "technician", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

const registrationFields = {
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(191),
  phone: z.string().trim().max(30).optional().nullable(),
  password: z.string().min(8).max(72),
};

const technicianProfileFields = {
  bio: z.string().trim().max(5_000).optional().nullable(),
  yearsExperience: z.coerce.number().int().min(0).max(255).default(0),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  serviceRadiusKm: z.coerce.number().positive().max(999.99).default(50),
};

export const registerSchema = z.discriminatedUnion("role", [
  z.object({
    ...registrationFields,
    role: z.literal("customer"),
  }),
  z.object({
    ...registrationFields,
    role: z.literal("technician"),
    ...technicianProfileFields,
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(191),
  password: z.string().min(1).max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;

const serverEnvSchema = z.object({
  DB_HOST: z.string().trim().min(1).default("localhost"),
  DB_USER: z.string().trim().min(1).default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().trim().min(1).default("technician_finder_simple"),
  DB_PORT: z.coerce.number().int().min(1).max(65_535).default(3306),
  JWT_SECRET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
  });
}
