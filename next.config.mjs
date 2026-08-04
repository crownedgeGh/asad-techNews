import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: process.env.CLOUDFLARE_R2_BUCKET_NAME
          ? `${process.env.CLOUDFLARE_R2_BUCKET_NAME}.r2.dev`
          : '**.r2.dev',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
