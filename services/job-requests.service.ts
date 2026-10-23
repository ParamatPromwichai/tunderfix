import * as jobRequestsRepo from "@/repositories/job-requests.repository";
import * as jobsRepo from "@/repositories/jobs.repository";

export async function sendJobRequest(input: {
  jobId: string;
  technicianId: string;
  message?: string;
  quotedPrice?: number;
}) {
  return await jobRequestsRepo.createJobRequest(input);
}

export async function getJobRequests(jobId: string) {
  return await jobRequestsRepo.getRequestsByJob(jobId);
}

export async function getTechnicianRequests(technicianId: string) {
  return await jobRequestsRepo.getRequestsByTechnician(technicianId);
}

export async function acceptRequest(requestId: string, jobId: string, technicianId: string) {
  // 1. Update request status
  await jobRequestsRepo.updateRequestStatus(requestId, 'accepted', true);
  // 2. Assign technician to job and update job status
  await jobsRepo.assignTechnician(jobId, technicianId);
  return true;
}

export async function rejectRequest(requestId: string) {
  return await jobRequestsRepo.updateRequestStatus(requestId, 'rejected', true);
}
