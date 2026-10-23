import * as usersRepo from "@/repositories/users.repository";

export async function getUserProfile(userId: string) {
  return await usersRepo.getUserProfile(userId);
}

export async function updateUserProfile(userId: string, data: {
  fullName: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  addressText: string;
  avatarUrl?: string | null;
}) {
  return await usersRepo.updateUserProfile(userId, data);
}

export async function updateTechnicianProfile(userId: string, data: {
  bio: string;
  yearsExperience: number;
  serviceRadiusKm: number;
}) {
  return await usersRepo.updateTechnicianProfile(userId, data);
}
