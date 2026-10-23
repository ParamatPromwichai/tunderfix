import { z } from "zod";

import { databaseEnvSchema, getDatabaseEnv } from "@/lib/database-config.mjs";

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

const serverEnvSchema = databaseEnvSchema.extend({
  JWT_SECRET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    ...getDatabaseEnv(),
    JWT_SECRET: process.env.JWT_SECRET,
  });
}
