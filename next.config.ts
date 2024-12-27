import path from 'path';
import dotenv from 'dotenv';
import type { Configuration } from 'webpack';

dotenv.config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || 'development'}.local`),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config: Configuration) => {
    // Ensure that resolve and alias are objects
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    // Type assertion to make TypeScript understand the structure
    const alias = config.resolve.alias as Record<string, string>;

    // Set the alias
    alias['@'] = path.join(__dirname, 'src');

    return config;
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  images: {
    domains: ['img.clerk.com'],
  },
  // ... other configurations ...
};

export default nextConfig;