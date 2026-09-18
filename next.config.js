/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  // Vercel: SPA demók + booking API. A public/projects fájlok elsőbbséget élveznek a rewrite-okkal szemben.
  async rewrites() {
    return [
      {
        source: "/projects/project-2/api/:path*",
        destination: "/api/booking/:path*",
      },
      {
        source: "/projects/project-2",
        destination: "/projects/project-2/index.html",
      },
      {
        source: "/projects/project-2/",
        destination: "/projects/project-2/index.html",
      },
      {
        source: "/projects/project-2/:path*",
        destination: "/projects/project-2/index.html",
      },
      {
        source: "/projects/project-3",
        destination: "/projects/project-3/index.html",
      },
      {
        source: "/projects/project-3/",
        destination: "/projects/project-3/index.html",
      },
      {
        source: "/projects/project-3/:path*",
        destination: "/projects/project-3/index.html",
      },
    ];
  },
};

module.exports = nextConfig;
