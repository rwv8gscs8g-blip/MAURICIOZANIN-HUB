/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './data/inovajuntos/**/*',
        './data/uploads/**/*',
        './public/resources/**/*',
        '**/*.mp4',
        '**/*.mov',
        '**/*.zip',
        '**/*.pdf',
      ],
    },
  },
  // Carregar variáveis de ambiente do .env.build (gerado em pre-build.js)
  env: {
    // Essas variáveis serão injetadas em build time
    // NEXT_PUBLIC_VERSION, NEXT_PUBLIC_BUILD, NEXT_PUBLIC_BUILD_DATE, NEXT_PUBLIC_ENVIRONMENT
  },
}

module.exports = nextConfig
