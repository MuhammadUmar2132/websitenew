/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/api/portraits/**", // allows all men/women portraits
      },
      {
        protocol: "https",
        hostname: "assets.example.com",
        port: "",
        pathname: "/account123/**", // if you still need this
      },
    ],
  },

  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
};

export default nextConfig;
