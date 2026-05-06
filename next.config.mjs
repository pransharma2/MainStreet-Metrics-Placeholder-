/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Tell the browser to honor the response Content-Type (no MIME sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow framing the site (clickjacking guard); covers older browsers.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Limit referrer leakage.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features we don't use.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  // Force HTTPS (only meaningful behind TLS; harmless on localhost).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't leak the framework via the X-Powered-By header.
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
