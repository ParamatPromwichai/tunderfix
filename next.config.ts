import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep integration-test builds separate from an already-running local preview.
  distDir: process.env.THUNDERFIX_QA === "1" ? ".next-qa" : ".next",
};

export default nextConfig;
