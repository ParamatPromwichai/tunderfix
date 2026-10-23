import * as technicianServicesRepo from "@/repositories/technician-services.repository";

export async function getTechnicianServices(technicianId: string) {
  return await technicianServicesRepo.getServicesByTechnicianId(technicianId);
}

export async function addService(input: {
  technicianId: string;
  categoryId: string;
  priceMin?: number;
  priceMax?: number;
  experienceYears?: number;
  description?: string;
}) {
  return await technicianServicesRepo.addTechnicianService(input);
}

export async function updateServicePricing(id: string, technicianId: string, input: {
  priceMin?: number | null;
  priceMax?: number | null;
  experienceYears?: number | null;
  description?: string | null;
}) {
  return await technicianServicesRepo.updateTechnicianService(id, technicianId, input);
}

export async function removeService(id: string, technicianId: string) {
  return await technicianServicesRepo.removeTechnicianService(id, technicianId);
}
