import * as jobsRepo from "@/repositories/jobs.repository";

export async function createNewJob(input: {
  customerId: string;
  categoryId: string;
  title: string;
  description: string;
  addressText: string;
  latitude: number;
  longitude: number;
  technicianId?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredDate?: string;
  preferredTime?: string;
}) {
  return await jobsRepo.createJob(input);
}

export async function getJobDetails(id: string) {
  return await jobsRepo.getJobById(id);
}

export async function updateStatus(id: string, status: jobsRepo.JobStatus) {
  return await jobsRepo.updateJobStatus(id, status);
}

export async function setFinalPrice(id: string, price: number) {
  return await jobsRepo.updateJobFinalPrice(id, price);
}

export async function getCustomerJobs(customerId: string) {
  return await jobsRepo.getJobsByCustomer(customerId);
}

export async function getTechnicianJobs(technicianId: string) {
  return await jobsRepo.getJobsByTechnician(technicianId);
}
