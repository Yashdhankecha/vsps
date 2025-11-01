const cloudinary = require('cloudinary').v2;

// Check if required environment variables are present
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('Missing required environment variables:', missingEnvVars);
  console.warn('Cloudinary functionality will be disabled');
  // Don't exit, just disable Cloudinary functionality
}

// Only configure Cloudinary if all environment variables are present
if (missingEnvVars.length === 0) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Helper function to upload files to Cloudinary
const uploadToCloudinary = async (file, folder = 'website-content') => {
  // If Cloudinary is not configured, return a mock result
  if (missingEnvVars.length > 0) {
    console.warn('Cloudinary not configured, returning mock result');
    return {
      secure_url: '/uploads/' + (file.originalname || 'mock-file.jpg'),
      public_id: 'mock-public-id'
    };
  }
  
  try {
    if (!file || !file.path) {
      throw new Error('Missing required parameter - file');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary
}; 