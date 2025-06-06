/**@type {import("next").NextConfig} */
module.exports = {
  webpack: (config, { isServer }) => {
    // Only on the server side
    if (isServer) {
      return config;
    }

    // Don't bundle these modules on the client side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      child_process: false,
      net: false,
      tls: false,
    };

    // Add resolver for node: protocol
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:child_process': false,
      'node:fs': false,
      'node:net': false,
      'node:tls': false,
    };

    return config;
  },
  reactStrictMode: true,
  images: {
    domains: ["gateway.pinata.cloud","api.dicebear.com"],
    formats: ["image/webp"],
    dangerouslyAllowSVG: true,
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  
};
