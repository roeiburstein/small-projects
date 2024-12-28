/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    EXCHANGERATE_API_KEY: process.env.EXCHANGERATE_API_KEY,
  },
}

module.exports = nextConfig
