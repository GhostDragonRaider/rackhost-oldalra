/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async headers() {
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "connect-src 'self'",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
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
