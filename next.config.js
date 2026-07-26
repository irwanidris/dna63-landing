/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/privacy.html',
        destination: '/privacy',
      },
      {
        source: '/delete-account.html',
        destination: '/delete-account',
      },
    ]
  },
}

module.exports = nextConfig
