import axios from '../utils/axiosConfig';

export const createFormNotification = async (formType, message) => {
  try {
    const response = await axios.post(
      '/api/notifications',
      {
        type: 'form',
        formType,
        message,
        read: false
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    
    return null;
  }
};

export const getNotifications = async () => {
  try {
    console.log('Fetching notifications from: /api/notifications');
    
    const response = await axios.get('/api/notifications');

    console.log('Notifications API response:', response.data);

    if (!response.data) {
      throw new Error('Invalid response format from notifications API');
    }

   
    const notifications = Array.isArray(response.data) 
      ? response.data 
      : response.data.notifications || [];

    if (!Array.isArray(notifications)) {
      throw new Error('Notifications data is not an array');
    }

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
   
    return [];
  }
};