/** @type {import('next').NextConfig} */

// Where the Express API lives. Server components call this directly;
// browser requests to /api/* are proxied to it by the rewrite below.
const API_URL = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ashwingane.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },

  /* ---------------------------------------------------------------------
     Every /api/* request the browser makes is forwarded to the backend.
     This is what keeps the two apps separate without paying for CORS or
     cross-site cookies: as far as the browser is concerned there is only
     one origin. It also means media URLs already saved inside post HTML
     (/api/media/<id>) keep resolving exactly as they did before.
  --------------------------------------------------------------------- */
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
