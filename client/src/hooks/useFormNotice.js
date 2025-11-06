import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { createFormNotification } from '../services/notificationService';

const NOTICE_SHOWN_KEY = 'notice_shown';
const LAST_FORM_STATUS_KEY = 'last_form_status';

const forms = [
  { 
    name: 'registrationForm',
    title: 'Samuh Lagan Registration',
    route: '/samuh-lagan',
    formType: 'samuhLagan'
  },
  { 
    name: 'studentAwardForm',
    title: 'Student Award Registration',
    route: '/student-awards',
    formType: 'studentAward'
  }
  // Removed teamRegistration form
];

const useFormNotice = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [activeForms, setActiveForms] = useState([]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkFormVisibility = async () => {
      try {
        
        const lastStatus = JSON.parse(localStorage.getItem(LAST_FORM_STATUS_KEY) || '{}');
        const activeFormsArray = [];
        
        for (const form of forms) {
          try {
            const response = await axios.get(`/api/admin/forms/check-form-visibility/${form.name}`);
            
            if (!mounted) return;

            const currentStatus = response.data.visible;
            const wasActive = lastStatus[form.name];
            
           
            if (currentStatus && !wasActive) {
              try {
                const notification = await createFormNotification(
                  form.formType,
                  `${form.title} is now open for registration. Click here to fill the form.`
                );
                if (notification) {
                  console.log('Notification created successfully:', notification);
                }
              } catch (notifError) {
                console.error('Error creating notification:', notifError);
                
              }
            }

            lastStatus[form.name] = currentStatus;

            if (currentStatus && mounted) {
              const formData = {
                ...form,
                message: `${form.title} is now open. Please fill the form before the deadline.`,
                deadline: response.data.timing?.endTime
              };
              
              activeFormsArray.push(formData);
            }
          } catch (formError) {
            console.error(`Error checking visibility for ${form.name}:`, formError);
            continue;
          }
        }

    
        localStorage.setItem(LAST_FORM_STATUS_KEY, JSON.stringify(lastStatus));

        if (mounted && activeFormsArray.length > 0) {
          setActiveForms(activeFormsArray);
          setShowNotice(true);
        }
      } catch (error) {
        console.error('Error in form visibility check:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkFormVisibility();

    
    const interval = setInterval(checkFormVisibility, 5 * 60 * 1000); 

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCloseNotice = () => {
    if (currentFormIndex < activeForms.length - 1) {
      
      setCurrentFormIndex(prev => prev + 1);
    } else {
     
      setShowNotice(false);
      setCurrentFormIndex(0);
      sessionStorage.setItem(NOTICE_SHOWN_KEY, 'true');
    }
  };

  return {
    showNotice,
    activeForm: activeForms[currentFormIndex],
    loading,
    handleCloseNotice
  };
};

export default useFormNotice;