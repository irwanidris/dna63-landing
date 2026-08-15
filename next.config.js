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
      {
        source: '/terms.html',
        destination: '/terms',
      },
    ]
  },
}

module.exports = nextConfig
