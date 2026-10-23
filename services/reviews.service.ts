import * as reviewsRepo from "@/repositories/reviews.repository";

export async function submitReview(input: {
  jobId: string;
  customerId: string;
  technicianId: string;
  rating: number;
  comment?: string;
}) {
  return await reviewsRepo.createReview(input);
}

export async function getTechnicianReviews(technicianId: string) {
  return await reviewsRepo.getReviewsByTechnician(technicianId);
}

export async function getJobReview(jobId: string) {
  return await reviewsRepo.getReviewByJob(jobId);
}
