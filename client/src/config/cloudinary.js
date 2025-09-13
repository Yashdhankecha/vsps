
const FOLDERS = {
 
  USER_DATA: 'user-data',
  USER_PROFILES: 'user-data/profiles',
  USER_DOCUMENTS: 'user-data/documents',
  USER_GALLERY: 'user-data/gallery',
  
  
  WEBSITE_CONTENT: 'website-content',
  SLIDES: 'website-content/slides',
  GALLERY: 'website-content/gallery',
  LEADERSHIP: 'website-content/leadership',
  ABOUT: 'website-content/about',
  DOWNLOADS: 'website-content/downloads'
};

export const uploadToCloudinary = async (file, folder) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    
    let folderPath = folder;
    if (folder.startsWith('user-data')) {
      folderPath = folder;
    } else if (folder.startsWith('website-content')) {
      folderPath = folder;
    } else {
      folderPath = FOLDERS.WEBSITE_CONTENT;
    }
    
    formData.append('folder', folderPath);

    
    console.log('Attempting to upload to Cloudinary:', {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      folder: folderPath,
      fileType: file.type,
      fileSize: file.size
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload failed:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const timestamp = Math.round((new Date).getTime()/1000);
    const signature = generateSignature(publicId, timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          signature: signature,
          api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
          timestamp: timestamp
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};


const generateSignature = (publicId, timestamp) => {
  
  console.warn('Signature generation should be handled by the server');
  return '';
};


export { FOLDERS }; 