/** @type {import('next').NextConfig} */

// Static export for main-frontend (apex landing app).
// - output: 'export' produces the `out/` directory for static hosting.
// - images.unoptimized: true is required when using static export (no server-side image optimization).
// - trailingSlash: true keeps paths clean for static hosting and emits 404.html for unmatched paths.
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
