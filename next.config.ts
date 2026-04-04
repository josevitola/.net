import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // disables server-side rendering and generates static HTML files for each page -- curse you Hostinger!
  output: 'export',
};

export default nextConfig;
