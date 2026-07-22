/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ashwingane.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
