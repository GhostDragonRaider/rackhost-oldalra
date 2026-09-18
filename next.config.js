/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  skipTrailingSlashRedirect: true,
};

if (isProd) {
  nextConfig.output = "export";
} else {
  // next dev: API proxy a booking backend felé, SPA fallback a többi project-2/3 útvonalra.
  // A public/ fájlok (main.js, static) előbb szolgálódnak ki, mint a rewrite.
  nextConfig.rewrites = async () => [
    {
      source: "/projects/project-2/api/:path*",
      destination: "http://127.0.0.1:8000/api/:path*",
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
}

module.exports = nextConfig;
