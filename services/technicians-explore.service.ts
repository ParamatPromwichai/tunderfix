import * as repo from "@/repositories/technicians-explore.repository";

export async function searchTechnicians(lat: number, lng: number, categoryId?: string, query?: string) {
  return await repo.searchTechnicians(lat, lng, categoryId, query);
}
