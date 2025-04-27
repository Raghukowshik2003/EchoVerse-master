import withPWAInit from 'next-pwa'; 

const withPWA = withPWAInit({
  dest: 'public', // Destination directory for service worker files
  register: true, // Register the service worker
  skipWaiting: true, // Install new service worker versions immediately
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
});



/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this 'images' section
  images: {
    domains: [
      "api.microlink.io", // Microlink Image Preview
    ],
  },



  reactStrictMode: true, // Good practice for highlighting potential problems
  compiler: {
    styledComponents: true, // Add this line - needed for your Button.tsx using styled-components
  },


  // Keep any other configurations you might have here
};

export default withPWA(nextConfig);