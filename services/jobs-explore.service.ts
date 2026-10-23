// Force turbopack rebuild
import * as jobsExploreRepo from "@/repositories/jobs-explore.repository";

export async function getOpenJobsForTechnician(technicianId: string) {
  return await jobsExploreRepo.getOpenJobs(technicianId);
}

export async function getDirectRequestsForTechnician(technicianId: string) {
  return await jobsExploreRepo.getDirectRequests(technicianId);
}
