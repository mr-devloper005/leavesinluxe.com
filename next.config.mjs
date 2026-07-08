import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  turbopack: {
    root: __dirname,
  },

  async redirects() {
    return [
      {
        source: '/articles',
        destination: '/article',
        permanent: true,
      },
      {
        source: '/articles/:slug*',
        destination: '/article/:slug*',
        permanent: true,
      },
      {
        source: '/classifieds',
        destination: '/classified',
        permanent: true,
      },
      {
        source: '/classifieds/:slug*',
        destination: '/classified/:slug*',
        permanent: true,
      },
      {
        source: '/listings',
        destination: '/listing',
        permanent: true,
      },
      {
        source: '/listings/:slug*',
        destination: '/listing/:slug*',
        permanent: true,
      },
      {
        source: '/image-sharing',
        destination: '/image',
        permanent: true,
      },
      {
        source: '/image-sharing/:slug*',
        destination: '/image/:slug*',
        permanent: true,
      },
      {
        source: '/users',
        destination: '/user',
        permanent: true,
      },
      {
        source: '/users/:slug*',
        destination: '/user/:slug*',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/article',
        destination: '/articles',
      },
      {
        source: '/article/:slug*',
        destination: '/articles/:slug*',
      },
      {
        source: '/classified',
        destination: '/classifieds',
      },
      {
        source: '/classified/:slug*',
        destination: '/classifieds/:slug*',
      },
      {
        source: '/listing',
        destination: '/listings',
      },
      {
        source: '/listing/:slug*',
        destination: '/listings/:slug*',
      },
      {
        source: '/image',
        destination: '/image-sharing',
      },
      {
        source: '/image/:slug*',
        destination: '/image-sharing/:slug*',
      },
      {
        source: '/user',
        destination: '/profile',
      },
      {
        source: '/user/:slug*',
        destination: '/profile/:slug*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              [
                "default-src 'self'",
                "img-src 'self' data: blob: https: http:",
                `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com${isProd ? "" : " https://vercel.live"}`,
                "style-src 'self' 'unsafe-inline'",
                "connect-src 'self' https: http: wss:",
                "frame-src 'self' https://www.google.com https://www.google.com/maps https://maps.google.com https://api.seoparadox.com https://www.openstreetmap.org https://openstreetmap.org",
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join("; "),
          },
        ],
      },
    ];
  },

}

export default nextConfig
