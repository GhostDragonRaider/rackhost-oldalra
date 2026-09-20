/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/contact", destination: "/kapcsolat", permanent: true },
      { source: "/about", destination: "/rolam", permanent: true },
    ];
  },
  // Demo SPA fallback + booking API proxy (dev). Production uses vercel.json rewrites.
  async rewrites() {
    return [
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
      {
        source: "/projects/project-4",
        destination: "/projects/project-4/index.html",
      },
      {
        source: "/projects/project-4/",
        destination: "/projects/project-4/index.html",
      },
      {
        source: "/projects/project-4/:path*",
        destination: "/projects/project-4/index.html",
      },
      {
        source: "/projects/project-5",
        destination: "/projects/project-5/index.html",
      },
      {
        source: "/projects/project-5/",
        destination: "/projects/project-5/index.html",
      },
      {
        source: "/projects/project-5/:path*",
        destination: "/projects/project-5/index.html",
      },
    ];
  },
};

module.exports = nextConfig;
