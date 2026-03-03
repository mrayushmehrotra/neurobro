import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // disable in dev to avoid SW noise
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Silence the "webpack config but no turbopack config" warning in dev.
  // next-pwa only injects its webpack plugin during production builds.
  turbopack: {},
};

export default withPWA(nextConfig);
