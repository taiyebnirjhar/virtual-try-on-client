/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  reactStrictMode: false,
  trailingSlash: true,
};

export default nextConfig;
