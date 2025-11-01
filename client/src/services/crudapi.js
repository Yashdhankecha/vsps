import axios from '../utils/axiosConfig';

// Helper function for API calls
const apiRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: endpoint,
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
      params,
      data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Home Content
export const getHomeContent = async () => {
  try {
    const response = await axios.get('/api/content/home');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateHomeContent = async (id, data) => {
  return apiRequest('put', `/api/content/home/${id}`, data);
};

export const addSlide = async (formData) => {
  try {
    const response = await axios.post('/api/content/home/slides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateSlide = async (id, formData) => {
  try {
    const response = await axios.put(`/api/content/home/slides/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const deleteSlide = async (id) => {
  try {
    const response = await axios.delete(`/api/content/home/slides/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateAboutSection = async (formData) => {
  try {
    // Create a new FormData instance if plain object is passed
    const data = formData instanceof FormData ? formData : new FormData();
    
    // If formData is a plain object, append each field to FormData
    if (!(formData instanceof FormData)) {
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key] instanceof File) {
          data.append('image', formData[key]);
        } else if (key === 'features' && Array.isArray(formData[key])) {
          data.append('features', JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
    }

    const response = await axios.put('/api/content/home/about', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update about section');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating about section:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update about section');
  }
};

export const addLeader = async (formData) => {
  try {
    const response = await axios.post('/api/content/home/leadership', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateLeader = async (id, formData) => {
  try {
    const response = await axios.put(`/api/content/home/leadership/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const deleteLeader = async (id) => {
  try {
    const response = await axios.delete(`/api/content/home/leadership/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Event Categories
export const getEventCategories = async () => {
  try {
    const response = await axios.get('/api/content/events/categories');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const createEventCategory = async (formData) => {
  try {
    const response = await axios.post(
      '/api/content/events/categories',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateEventCategory = async (id, formData) => {
  try {
    console.log('Updating event category with data:', {
      id,
      formData: formData instanceof FormData ? 'FormData object' : formData
    });

    // If formData is not a FormData instance, create one
    const data = formData instanceof FormData ? formData : new FormData();
    
    // If formData is a plain object, append each field to FormData
    if (!(formData instanceof FormData)) {
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key] instanceof File) {
          data.append('image', formData[key]);
        } else if (['features', 'packages', 'membershipPricing'].includes(key)) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
    }

    const response = await axios.put(
      `/api/content/events/categories/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating event category:', error);
    return handleError(error);
  }
};

export const deleteEventCategory = async (id) => {
  try {
    const response = await axios.delete(
      `/api/content/events/categories/${id}`,
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Gallery
export const getGalleryItems = async (type) => {
  try {
    const response = await axios.get(`/api/content/gallery${type ? `?type=${type}` : ''}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch gallery items: ${error.message}`);
  }
};

export const createGalleryItem = async (formData) => {
  try {
    console.log('Creating gallery item with form data:', {
      hasFile: formData.has('file'),
      category: formData.get('category'),
      type: formData.get('type')
    });
    
    const response = await axios.post(`/api/content/gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Gallery item creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating gallery item:', error);
    
    // Extract more detailed error message if available
    const errorMessage = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data?.error || '';
    
    throw new Error(`Failed to create gallery item: ${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
  }
};

export const updateGalleryItem = async (id, formData) => {
  try {
    const response = await axios.put(`/api/content/gallery/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update gallery item: ${error.message}`);
  }
};

export const deleteGalleryItem = async (id) => {
  try {
    const response = await axios.delete(`/api/content/gallery/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete gallery item: ${error.message}`);
  }
};

// Helper function to handle API responses
const handleResponse = (response) => {
  if (!response.data) {
    throw new Error('Invalid response format');
  }

  if (!response.data.success && response.data.message) {
    throw new Error(response.data.message);
  }

  return response.data;
};

// Helper function to handle API errors
const handleError = (error) => {
  console.error('API Error:', error);
  
  // Handle network errors
  if (!error.response) {
    throw new Error('Network error - Please check your connection');
  }

  // Handle specific error cases
  const status = error.response.status;
  const message = error.response.data?.message || error.message;

  switch (status) {
    case 404:
      throw new Error('Resource not found - Please refresh the page');
    case 401:
      throw new Error('Unauthorized - Please login again');
    case 403:
      throw new Error('Access denied - You don\'t have permission');
    case 500:
      throw new Error('Server error - Please try again later');
    default:
      throw new Error(message || 'An unexpected error occurred');
  }
};

// Home Content API
export const getHomeContentAPI = async () => {
  try {
    const response = await axios.get(`/api/content/home`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Slides API
export const addSlideAPI = async (slideData) => {
  try {
    const formData = new FormData();
    Object.keys(slideData).forEach(key => {
      if (key === 'image' && slideData[key] instanceof File) {
        formData.append('image', slideData[key]);
      } else {
        formData.append(key, slideData[key]);
      }
    });
    
    const response = await axios.post(`/api/content/home/slides`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateSlideAPI = async (id, slideData) => {
  try {
    const formData = new FormData();
    Object.keys(slideData).forEach(key => {
      if (key === 'image' && slideData[key] instanceof File) {
        formData.append('image', slideData[key]);
      } else {
        formData.append(key, slideData[key]);
      }
    });
    
    const response = await axios.put(`/api/content/home/slides/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const deleteSlideAPI = async (id) => {
  try {
    const response = await axios.delete(`/api/content/home/slides/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Leadership API
export const addLeaderAPI = async (leaderData) => {
  try {
    const formData = new FormData();
    Object.keys(leaderData).forEach(key => {
      if (key === 'image' && leaderData[key] instanceof File) {
        formData.append('image', leaderData[key]);
      } else {
        formData.append(key, leaderData[key]);
      }
    });
    
    const response = await axios.post(`/api/content/home/leadership`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateLeaderAPI = async (id, leaderData) => {
  try {
    const formData = new FormData();
    Object.keys(leaderData).forEach(key => {
      if (key === 'image' && leaderData[key] instanceof File) {
        formData.append('image', leaderData[key]);
      } else {
        formData.append(key, leaderData[key]);
      }
    });
    
    const response = await axios.put(`/api/content/home/leadership/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const deleteLeaderAPI = async (id) => {
  try {
    const response = await axios.delete(`/api/content/home/leadership/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// About Section API
export const updateAboutAPI = async (aboutData) => {
  try {
    const formData = new FormData();
    Object.keys(aboutData).forEach(key => {
      if (key === 'image' && aboutData[key] instanceof File) {
        formData.append('image', aboutData[key]);
      } else if (key === 'features') {
        formData.append('features', JSON.stringify(aboutData[key]));
      } else {
        formData.append(key, aboutData[key]);
      }
    });
    
    const response = await axios.put(`/api/content/home/about`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Stats API
export const updateStatsAPI = async (statsData) => {
  try {
    const response = await axios.put(`/api/content/home/stats`, { stats: statsData });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateStats = async (stats) => {
  try {
    const response = await axios.put(`/api/content/home/stats`, { stats });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating stats:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update stats');
  }
};

// New Home Content API calls
export const getHomeContentNew = async () => {
  try {
    const response = await axios.get(`/api/content/home`);
    return response.data;
  } catch (error) {
    console.error('Error fetching home content:', error);
    throw error;
  }
};

export const updateHomeContentNew = async (contentId, content) => {
  try {
    const response = await axios.post(`/api/content/home/${contentId}`, content);
    return response.data;
  } catch (error) {
    console.error('Error updating home content:', error);
    throw error;
  }
};

// Hero Slider API calls
export const addSlideNew = async (slideData) => {
  try {
    const formData = new FormData();
    Object.keys(slideData).forEach(key => {
      if (key === 'image' && slideData[key] instanceof File) {
        formData.append('image', slideData[key]);
      } else {
        formData.append(key, slideData[key]);
      }
    });
    
    const response = await axios.post(`/api/content/home/slides`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding slide:', error);
    throw error;
  }
};

export const updateSlideNew = async (slideId, slideData) => {
  try {
    const formData = new FormData();
    Object.keys(slideData).forEach(key => {
      if (key === 'image' && slideData[key] instanceof File) {
        formData.append('image', slideData[key]);
      } else {
        formData.append(key, slideData[key]);
      }
    });
    
    const response = await axios.put(`/api/content/home/slides/${slideId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating slide:', error);
    throw error;
  }
};

export const deleteSlideNew = async (slideId) => {
  try {
    const response = await axios.delete(`/api/content/home/slides/${slideId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting slide:', error);
    throw error;
  }
};

// Introduction Section API calls
export const updateIntroduction = async (contentId, introductionData) => {
  try {
    const response = await axios.put(`/api/content/home/introduction/${contentId}`, introductionData);
    return response.data;
  } catch (error) {
    console.error('Error updating introduction:', error);
    throw error;
  }
};

// About Section API calls
export const updateAboutNew = async (contentId, aboutData) => {
  try {
    const formData = new FormData();
    Object.keys(aboutData).forEach(key => {
      if (key === 'image' && aboutData[key] instanceof File) {
        formData.append('image', aboutData[key]);
      } else {
        formData.append(key, aboutData[key]);
      }
    });
    
    const response = await axios.put(`/api/content/home/about/${contentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating about section:', error);
    throw error;
  }
};

// Leadership Section API calls
export const updateLeadership = async (contentId, leadershipData) => {
  try {
    const formData = new FormData();
    Object.keys(leadershipData).forEach(key => {
      if (key === 'members') {
        formData.append('members', JSON.stringify(leadershipData[key]));
      } else if (key === 'image' && leadershipData[key] instanceof File) {
        formData.append('image', leadershipData[key]);
      } else {
        formData.append(key, leadershipData[key]);
      }
    });
    
    const response = await axios.put(`/api/content/home/leadership/${contentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating leadership section:', error);
    throw error;
  }
};