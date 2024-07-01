/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
            },
        ],
    },
    output: 'standalone',
};

export default nextConfig;
