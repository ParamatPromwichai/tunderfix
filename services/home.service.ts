import {
  findHomeCategories,
  findRecentJobs,
  findRecommendedTechnicians,
  getHomeStats,
  type HomeCategoryRecord,
  type HomeJobRecord,
  type HomeStatsRecord,
  type HomeTechnicianRecord,
} from "@/repositories/home.repository";

export interface HomeDashboard {
  categories: HomeCategoryRecord[];
  technicians: HomeTechnicianRecord[];
  recentJobs: HomeJobRecord[];
  stats: HomeStatsRecord;
  isDatabaseConnected: boolean;
}

const fallbackCategories: HomeCategoryRecord[] = [
  {
    id: "fallback-air",
    name: "ซ่อมแอร์",
    description: "ล้าง ติดตั้ง และซ่อมเครื่องปรับอากาศ",
    totalJobs: 128,
  },
  {
    id: "fallback-electric",
    name: "ซ่อมไฟฟ้า",
    description: "ปลั๊ก สายไฟ และระบบไฟฟ้า",
    totalJobs: 96,
  },
  {
    id: "fallback-plumbing",
    name: "ซ่อมประปา",
    description: "ท่อน้ำ ก๊อกน้ำ และระบบประปา",
    totalJobs: 74,
  },
  {
    id: "fallback-computer",
    name: "ซ่อมคอมพิวเตอร์",
    description: "ซ่อมและอัปเกรดคอมพิวเตอร์",
    totalJobs: 52,
  },
];

const fallbackTechnicians: HomeTechnicianRecord[] = [
  {
    id: "fallback-kitti",
    name: "ช่างกิตติ",
    skill: "ซ่อมแอร์, ซ่อมไฟฟ้า",
    yearsExperience: 8,
    isAvailable: true,
    rating: 4.9,
    totalReviews: 86,
    minPrice: 450,
    maxPrice: 1200,
  },
  {
    id: "fallback-min",
    name: "ช่างมิน",
    skill: "ซ่อมประปา, งานบ้าน",
    yearsExperience: 6,
    isAvailable: true,
    rating: 4.8,
    totalReviews: 64,
    minPrice: 350,
    maxPrice: 900,
  },
  {
    id: "fallback-fixpro",
    name: "ทีม FixPro",
    skill: "ซ่อมคอมพิวเตอร์",
    yearsExperience: 10,
    isAvailable: false,
    rating: 4.7,
    totalReviews: 112,
    minPrice: 500,
    maxPrice: 1500,
  },
];

const fallbackJobs: HomeJobRecord[] = [
  {
    id: "fallback-job-air",
    title: "แอร์ไม่เย็น",
    area: "ลาดพร้าว",
    status: "requested",
    budgetMin: 800,
    budgetMax: 1200,
    categoryName: "ซ่อมแอร์",
  },
  {
    id: "fallback-job-electric",
    title: "ปลั๊กไฟมีประกาย",
    area: "บางนา",
    status: "on_the_way",
    budgetMin: 600,
    budgetMax: 900,
    categoryName: "ซ่อมไฟฟ้า",
  },
  {
    id: "fallback-job-plumbing",
    title: "ท่อน้ำรั่วใต้อ่าง",
    area: "พระราม 9",
    status: "accepted",
    budgetMin: 500,
    budgetMax: 750,
    categoryName: "ซ่อมประปา",
  },
];

const fallbackStats: HomeStatsRecord = {
  totalJobs: 1280,
  completedJobs: 1048,
  technicianCount: 420,
  openJobs: 24,
};

export async function getHomeDashboard(): Promise<HomeDashboard> {
  try {
    const [categories, technicians, recentJobs, stats] = await Promise.all([
      findHomeCategories(),
      findRecommendedTechnicians(),
      findRecentJobs(),
      getHomeStats(),
    ]);

    return {
      categories,
      technicians,
      recentJobs,
      stats,
      isDatabaseConnected: true,
    };
  } catch (error) {
    console.error("[home] Unable to load dashboard from database", error);

    return {
      categories: fallbackCategories,
      technicians: fallbackTechnicians,
      recentJobs: fallbackJobs,
      stats: fallbackStats,
      isDatabaseConnected: false,
    };
  }
}
