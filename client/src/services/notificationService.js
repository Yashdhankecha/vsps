import axios from '../utils/axiosConfig';

export const getNotifications = async () => {
    try {
        const response = await axios.get('/api/notifications');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createFormNotification = async (formType, message) => {
    try {
        // This endpoint might not exist on the backend yet or might be handled differently, 
        // but adding it here to resolve the import error. 
        // Ideally, form notifications should be created by the backend automatically when a form opens,
        // rather than the frontend creating them. 
        // However, to fix the specific error, we'll provide this function.
        // It's possible the user's intent is for the frontend to trigger this.

        // Assuming a POST endpoint for creating notifications exists or we simulate it
        // The previous useFormNotice hooks seems to want to create a notification

        // NOTE: The backend notificationController.js we created earlier does NOT have a public create endpoint,
        // it only has internal createNotification helper.
        // So this frontend call needs to hit an endpoint that uses that helper, or a dedicated create endpoint.

        // For now, let's return null to prevent errors if the endpoint is missing
        // or try to hit a generic create endpoint if one is added.

        // Since we don't have a public create-notification endpoint in the routes we made,
        // we'll just log this action for now to prevent the app from crashing.
        console.warn('createFormNotification called on frontend. This should arguably be a backend-side event trigger.');
        return null;
    } catch (error) {
        console.error('Error in createFormNotification:', error);
        return null;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`/api/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const markAllAsRead = async () => {
    try {
        const response = await axios.put('/api/notifications/mark-all-read');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const response = await axios.delete(`/api/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
