import bcrypt from "bcrypt";

import {
  createUser,
  findUserByEmail,
  findUserById,
  type UserRecord,
} from "@/repositories/auth.repository";
import { createAuthToken } from "@/lib/auth";
import type { LoginInput, RegisterInput } from "@/lib/validations";

const BCRYPT_SALT_ROUNDS = 12;

export type PublicUser = Omit<UserRecord, "passwordHash">;

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
  };
}

export async function registerUser(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
  const user = await createUser({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone || null,
    passwordHash,
    role: input.role,
    technicianProfile:
      input.role === "technician"
        ? {
            bio: input.bio || null,
            yearsExperience: input.yearsExperience,
            latitude: input.latitude,
            longitude: input.longitude,
            serviceRadiusKm: input.serviceRadiusKm,
          }
        : undefined,
  });

  return {
    user: toPublicUser(user),
    token: createAuthToken(user),
  };
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class SuspendedAccountError extends Error {
  constructor() {
    super("This account is suspended");
    this.name = "SuspendedAccountError";
  }
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  if (user.status !== "active") {
    throw new SuspendedAccountError();
  }

  return {
    user: toPublicUser(user),
    token: createAuthToken(user),
  };
}

export async function getActiveUserById(id: string): Promise<PublicUser | null> {
  const user = await findUserById(id);

  if (!user || user.status !== "active") {
    return null;
  }

  return toPublicUser(user);
}
