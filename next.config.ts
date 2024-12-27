import path from 'path';
import dotenv from 'dotenv';
import type { Configuration } from 'webpack';

dotenv.config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || 'development'}.local`),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  images: {
    domains: ['img.clerk.com'],
  },
  // ... other configurations ...
};

export default nextConfig; 
