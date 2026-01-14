/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "ocumail-content.s3.eu-west-2.amazonaws.com",
      "s3.eu-west-2.amazonaws.com",
      "www.ocumail.com"
    ], 
  },
  
  async redirects() {
    return [
      // Example redirect rule (if necessary)
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/info_centre/list/:id',
        headers: [
          { key: 'X-Custom-Header', value: 'CustomHeaderValue' }
        ],
      },
    ]
  },
  
  // Any other configuration as needed
};

export default nextConfig;
