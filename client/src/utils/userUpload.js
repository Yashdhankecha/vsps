import { uploadToCloudinary, FOLDERS } from '../config/cloudinary';

export const uploadUserProfileImage = async (file) => {
  try {
    // Create a subfolder with the user's ID if available
    const folder = `${FOLDERS.USER_DATA}/profiles`;
    const imageUrl = await uploadToCloudinary(file, folder);
    return imageUrl;
  } catch (error) {
    console.error('Error uploading user profile image:', error);
    throw error;
  }
};

export const uploadUserDocument = async (file, documentType) => {
  try {
    // Create a subfolder for different types of documents
    const folder = `${FOLDERS.USER_DATA}/documents/${documentType}`;
    const fileUrl = await uploadToCloudinary(file, folder);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading user document:', error);
    throw error;
  }
};

export const uploadUserGalleryImage = async (file) => {
  try {
    const folder = `${FOLDERS.USER_DATA}/gallery`;
    const imageUrl = await uploadToCloudinary(file, folder);
    return imageUrl;
  } catch (error) {
    console.error('Error uploading user gallery image:', error);
    throw error;
  }
}; 