/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['damage-assessment-photos.s3.amazonaws.com'],
  },
  env: {
    APP_NAME: 'DamageAssessment AI',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig