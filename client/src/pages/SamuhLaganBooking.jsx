import React, { useState, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  Alert, 
  Box, 
  Typography, 
  TextField, 
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Container,
  Divider,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, CloudUpload, AccessTime, Person, Email, Phone, Home, Badge, Upload } from '@mui/icons-material';
import { styled } from '@mui/material/styles';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


const colors = {
  primary: {
    main: '#9333EA',
    light: '#A855F7',
    dark: '#7E22CE',
    gradient: 'linear-gradient(45deg, #9333EA, #A855F7)',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#F3E8FF',
    light: '#FAF5FF',
    dark: '#DDD6FE',
    text: '#6B21A8'
  },
  background: {
    light: '#FAFAFA',
    paper: '#ffffff',
    gradient: 'linear-gradient(135deg, #F3E8FF 0%, #ffffff 100%)'
  }
};

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(147, 51, 234, 0.08)',
  marginBottom: theme.spacing(3),
  backgroundColor: colors.background.paper,
  overflow: 'visible',
  position: 'relative',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(147, 51, 234, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: colors.primary.gradient,
    borderRadius: '16px 16px 0 0',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: colors.primary.gradient,
  color: colors.primary.contrastText,
  '&:hover': {
    background: `linear-gradient(45deg, ${colors.primary.dark}, ${colors.primary.main})`,
    boxShadow: '0 6px 16px rgba(147, 51, 234, 0.3)',
  },
  borderRadius: '12px',
  padding: '12px 32px',
  marginTop: theme.spacing(3),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)',
  transition: 'all 0.3s ease',
  '&:disabled': {
    background: '#e0e0e0',
    color: '#9e9e9e',
  },
}));

const TimeUnit = styled(Box)(({ theme }) => ({
  padding: '8px 12px',
  borderRadius: '8px',
  background: colors.primary.gradient,
  color: colors.primary.contrastText,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '70px',
  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.15)',
  position: 'relative',
  '&:not(:last-child)::after': {
    content: '":"',
    position: 'absolute',
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.primary.main,
    fontSize: '1.5rem',
    fontWeight: 700,
  }
}));

const TimeLabel = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  opacity: 0.9,
});

const TimeValue = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1.2,
});

const CountdownTimer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  background: `linear-gradient(135deg, ${colors.secondary.light} 0%, ${colors.background.paper} 100%)`,
  borderRadius: '16px',
  border: `1px solid ${colors.secondary.main}`,
  boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: colors.background.light,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary.main,
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.6)',
    '&.Mui-focused': {
      color: colors.primary.main,
    },
  },
  '& .MuiInputAdornment-root': {
    '& .MuiSvgIcon-root': {
      color: colors.primary.main,
    },
  },
}));

const PhotoUploadButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  backgroundColor: colors.secondary.main,
  color: colors.primary.main,
  border: `1px solid ${colors.secondary.main}`,
  '&:hover': {
    backgroundColor: colors.secondary.light,
    borderColor: colors.primary.main,
  },
  textTransform: 'none',
  fontSize: '0.9rem',
  boxShadow: '0 2px 8px rgba(147, 51, 234, 0.08)',
}));

const DocumentUploadButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '16px',
  backgroundColor: colors.background.light,
  color: colors.primary.main,
  border: `2px dashed ${colors.secondary.main}`,
  '&:hover': {
    backgroundColor: colors.secondary.light,
    border: `2px dashed ${colors.primary.main}`,
  },
  textTransform: 'none',
  fontSize: '0.9rem',
  minHeight: '100px',
  flexDirection: 'column',
  gap: '8px',
  transition: 'all 0.3s ease',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.12)',
  border: `4px solid ${colors.background.paper}`,
  backgroundColor: colors.secondary.main,
  color: colors.primary.main,
}));

const LoadingFallback = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
    <CircularProgress size={40} sx={{ color: colors.primary.main, mb: 2 }} />
    <Typography variant="body1" color="textSecondary">Loading form...</Typography>
  </Box>
);

const SamuhLaganBooking = ({ formDetails }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    bride: [],
    groom: []
  });
  const [formErrors, setFormErrors] = useState({});
  

  useEffect(() => {
    if (user) {
      setShowForm(true);
    }
  }, [user]);

  
  useEffect(() => {
    let countdownTimer;
    
    if (formDetails?.endTime) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const end = new Date(formDetails.endTime).getTime();
        const timeLeft = end - now;

        if (timeLeft <= 0) {
          setCountdown('');
          if (countdownTimer) {
            clearInterval(countdownTimer);
          }
          return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };

      updateCountdown(); 
      countdownTimer = setInterval(updateCountdown, 1000); 
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [formDetails]);

  
  useEffect(() => {
    const checkRedirectFromLogin = () => {
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath && user) {
        localStorage.removeItem('redirectAfterLogin');
        setShowForm(true);
      }
    };

    checkRedirectFromLogin();
  }, [user]); 

  
  const [formData, setFormData] = useState({
    
    brideName: '',
    brideFatherName: '',
    brideMotherName: '',
    brideAge: '',
    brideMobile: '',
    brideEmail: '',
    brideAddress: '',
    bridePhoto: null,
    brideDocuments: [],
    
    
    groomName: '',
    groomFatherName: '',
    groomMotherName: '',
    groomAge: '',
    groomMobile: '',
    groomEmail: '',
    groomAddress: '',
    groomPhoto: null,
    groomDocuments: []
  });


  const [bridePhotoPreview, setBridePhotoPreview] = useState(null);
  const [groomPhotoPreview, setGroomPhotoPreview] = useState(null);

  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

  
    if (!formData.brideName.trim()) errors.brideName = 'Bride\'s name is required.';
    if (!formData.brideFatherName.trim()) errors.brideFatherName = 'Bride\'s father\'s name is required.';
    if (!formData.brideMotherName.trim()) errors.brideMotherName = 'Bride\'s mother\'s name is required.';
    if (!formData.brideAge) errors.brideAge = 'Bride\'s age is required.';
    else if (isNaN(formData.brideAge) || +formData.brideAge < 18 || +formData.brideAge > 100) errors.brideAge = 'Bride\'s age must be a number between 18 and 100.';
    if (!formData.brideMobile.trim()) errors.brideMobile = 'Bride\'s mobile number is required.';
    else if (!phoneRegex.test(formData.brideMobile)) errors.brideMobile = 'Bride\'s mobile number must be 10 digits.';
    if (!formData.brideEmail.trim()) errors.brideEmail = 'Bride\'s email is required.';
    else if (!emailRegex.test(formData.brideEmail)) errors.brideEmail = 'Bride\'s email is invalid.';
    if (!formData.brideAddress.trim()) errors.brideAddress = 'Bride\'s address is required.';
    if (!formData.bridePhoto || formData.bridePhoto.length === 0) errors.bridePhoto = 'Bride\'s photo is required.';
    if (!formData.brideDocuments || formData.brideDocuments.length === 0) errors.brideDocuments = 'At least one document for the bride is required.';
    
    
    if (!formData.groomName.trim()) errors.groomName = 'Groom\'s name is required.';
    if (!formData.groomFatherName.trim()) errors.groomFatherName = 'Groom\'s father\'s name is required.';
    if (!formData.groomMotherName.trim()) errors.groomMotherName = 'Groom\'s mother\'s name is required.';
    if (!formData.groomAge) errors.groomAge = 'Groom\'s age is required.';
    else if (isNaN(formData.groomAge) || +formData.groomAge < 18 || +formData.groomAge > 100) errors.groomAge = 'Groom\'s age must be a number between 18 and 100.';
    if (!formData.groomMobile.trim()) errors.groomMobile = 'Groom\'s mobile number is required.';
    else if (!phoneRegex.test(formData.groomMobile)) errors.groomMobile = 'Groom\'s mobile number must be 10 digits.';
    if (!formData.groomEmail.trim()) errors.groomEmail = 'Groom\'s email is required.';
    else if (!emailRegex.test(formData.groomEmail)) errors.groomEmail = 'Groom\'s email is invalid.';
    if (!formData.groomAddress.trim()) errors.groomAddress = 'Groom\'s address is required.';
    if (!formData.groomPhoto || formData.groomPhoto.length === 0) errors.groomPhoto = 'Groom\'s photo is required.';
    if (!formData.groomDocuments || formData.groomDocuments.length === 0) errors.groomDocuments = 'At least one document for the groom is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files : value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (type === 'file') {
      if (name === 'bridePhoto' || name === 'groomPhoto') {
        const file = files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (name === 'bridePhoto') {
              setBridePhotoPreview(reader.result);
            } else {
              setGroomPhotoPreview(reader.result);
            }
          };
          reader.readAsDataURL(file);
        } else { 
            if (name === 'bridePhoto') setBridePhotoPreview(null);
            else setGroomPhotoPreview(null);
        }
      } else if (name === 'brideDocuments' || name === 'groomDocuments') {
        const newFiles = Array.from(files);
        const prefix = name === 'brideDocuments' ? 'bride' : 'groom';
        setUploadedDocuments(prev => ({
          ...prev,
          [prefix]: newFiles 
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to submit the form');
      }

      
      console.log('Current user object:', user);
      
      
      const userId = user?._id || user?.id || user?.userId;
      if (!userId) {
        throw new Error('User ID not found. Please try logging in again.');
      }

      const formDataToSend = new FormData();
      
      
      formDataToSend.append('user', userId);
      
      
      formDataToSend.append('bride.name', formData.brideName);
      formDataToSend.append('bride.fatherName', formData.brideFatherName);
      formDataToSend.append('bride.motherName', formData.brideMotherName);
      formDataToSend.append('bride.age', formData.brideAge);
      formDataToSend.append('bride.contactNumber', formData.brideMobile);
      formDataToSend.append('bride.email', formData.brideEmail);
      formDataToSend.append('bride.address', formData.brideAddress);
      
      if (formData.bridePhoto?.[0]) {
        formDataToSend.append('bridePhoto', formData.bridePhoto[0]);
      }
      if (formData.brideDocuments) {
        Array.from(formData.brideDocuments).forEach(file => {
          formDataToSend.append('brideDocuments', file);
        });
      }

    
      formDataToSend.append('groom.name', formData.groomName);
      formDataToSend.append('groom.fatherName', formData.groomFatherName);
      formDataToSend.append('groom.motherName', formData.groomMotherName);
      formDataToSend.append('groom.age', formData.groomAge);
      formDataToSend.append('groom.contactNumber', formData.groomMobile);
      formDataToSend.append('groom.email', formData.groomEmail);
      formDataToSend.append('groom.address', formData.groomAddress);
      
      if (formData.groomPhoto?.[0]) {
        formDataToSend.append('groomPhoto', formData.groomPhoto[0]);
      }
      if (formData.groomDocuments) {
        Array.from(formData.groomDocuments).forEach(file => {
          formDataToSend.append('groomDocuments', file);
        });
      }

      
      formDataToSend.append('ceremonyDate', formDetails.eventDate);

      
      console.log('Form data being sent:', {
        user: userId,
        bride: {
          name: formData.brideName,
          fatherName: formData.brideFatherName,
          motherName: formData.brideMotherName,
          age: formData.brideAge,
          contactNumber: formData.brideMobile,
          email: formData.brideEmail,
          address: formData.brideAddress
        },
        groom: {
          name: formData.groomName,
          fatherName: formData.groomFatherName,
          motherName: formData.groomMotherName,
          age: formData.groomAge,
          contactNumber: formData.groomMobile,
          email: formData.groomEmail,
          address: formData.groomAddress
        },
        ceremonyDate: formDetails.eventDate
      });

      const response = await fetch(`${API_BASE_URL}/api/bookings/samuh-lagan/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'An error occurred while submitting the form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleBookClick = () => {
    if (!user) {
      
      localStorage.setItem('redirectAfterLogin', '/samuh-lagan');
      navigate('/auth');
      return;
    }
    setShowForm(true);
  };

  const renderUploadedDocuments = (prefix) => {
    const documents = uploadedDocuments[prefix];
    if (documents.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Uploaded Documents:
        </Typography>
        <Grid container spacing={1}>
          {documents.map((file, index) => (
            <Grid item xs={12} key={index}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.secondary.light
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const url = URL.createObjectURL(file);
                      window.open(url, '_blank');
                    }}
                    sx={{
                      color: colors.primary.main,
                      borderColor: colors.primary.main,
                      '&:hover': {
                        borderColor: colors.primary.dark,
                        backgroundColor: colors.secondary.main
                      }
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setUploadedDocuments(prev => ({
                        ...prev,
                        [prefix]: prev[prefix].filter((_, i) => i !== index)
                      }));
                      setFormData(prev => ({
                        ...prev,
                        [`${prefix}Documents`]: Array.from(prev[`${prefix}Documents`] || []).filter((_, i) => i !== index)
                      }));
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.04)'
                      }
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderFormSection = (prefix, title, photoPreview) => (
    <StyledCard>
      <CardContent sx={{ p: 4, background: colors.background.paper }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            color: colors.primary.main,
            borderBottom: `2px solid ${colors.secondary.main}`,
            paddingBottom: 1
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <StyledAvatar
                src={photoPreview}
                sx={{ bgcolor: 'rgba(147, 51, 234, 0.08)' }}
              >
                <Person sx={{ fontSize: 40, color: colors.primary.main }} />
              </StyledAvatar>
              <PhotoUploadButton
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Upload Photo
                <input
                  type="file"
                  name={`${prefix}Photo`}
                  hidden
                  accept="image/*"
                  onChange={handleChange}
                />
              </PhotoUploadButton>
            </Box>
            {formErrors[`${prefix}Photo`] && <Alert severity="error" sx={{ mb: 2 }}>{formErrors[`${prefix}Photo`]}</Alert>}
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Full Name"
              name={`${prefix}Name`}
              value={formData[`${prefix}Name`]}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
              }}
              error={!!formErrors[`${prefix}Name`]}
              helperText={formErrors[`${prefix}Name`]}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StyledTextField
              fullWidth
              label="Father's Name"
              name={`${prefix}FatherName`}
              value={formData[`${prefix}FatherName`]}
              onChange={handleChange}
              required
              error={!!formErrors[`${prefix}FatherName`]}
              helperText={formErrors[`${prefix}FatherName`]}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StyledTextField
              fullWidth
              label="Mother's Name"
              name={`${prefix}MotherName`}
              value={formData[`${prefix}MotherName`]}
              onChange={handleChange}
              required
              error={!!formErrors[`${prefix}MotherName`]}
              helperText={formErrors[`${prefix}MotherName`]}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StyledTextField
              fullWidth
              label="Age"
              name={`${prefix}Age`}
              type="number"
              value={formData[`${prefix}Age`]}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />,
              }}
              error={!!formErrors[`${prefix}Age`]}
              helperText={formErrors[`${prefix}Age`]}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StyledTextField
              fullWidth
              label="Mobile Number"
              name={`${prefix}Mobile`}
              type="tel"
              value={formData[`${prefix}Mobile`]}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
              }}
              error={!!formErrors[`${prefix}Mobile`]}
              helperText={formErrors[`${prefix}Mobile`]}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Email"
              name={`${prefix}Email`}
              type="email"
              value={formData[`${prefix}Email`]}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
              }}
              error={!!formErrors[`${prefix}Email`]}
              helperText={formErrors[`${prefix}Email`]}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Address"
              name={`${prefix}Address`}
              value={formData[`${prefix}Address`]}
              onChange={handleChange}
              required
              multiline
              rows={3}
              InputProps={{
                startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />,
              }}
              error={!!formErrors[`${prefix}Address`]}
              helperText={formErrors[`${prefix}Address`]}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Upload Documents
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max size: 5MB per file)
              </Typography>
            </Box>
            <DocumentUploadButton
              component="label"
              startIcon={<CloudUpload />}
            >
              <input
                type="file"
                name={`${prefix}Documents`}
                onChange={handleChange}
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                hidden
              />
              <Typography variant="body2" sx={{ color: colors.primary.main }}>
                Click to upload documents
              </Typography>
              <Typography variant="caption" sx={{ color: colors.primary.main }}>
                or drag and drop files here
              </Typography>
            </DocumentUploadButton>
            {formErrors[`${prefix}Documents`] && <Alert severity="error" sx={{ mt: 1 }}>{formErrors[`${prefix}Documents`]}</Alert>}
            {renderUploadedDocuments(prefix)}
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );

  if (error) {
    return (
      <Container maxWidth="md">
        <Box p={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (submitSuccess) {
    return (
      <Container maxWidth="md">
        <Box p={3}>
          <Alert severity="success">
            Form submitted successfully! Redirecting to dashboard...
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ background: colors.background.light, borderRadius: '24px', my: 4 }}>
      <Box py={6}>
        <Typography 
          variant="h3" 
          align="center" 
          sx={{ 
            mb: 4, 
            fontWeight: 700,
            background: colors.primary.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(147, 51, 234, 0.1)',
          }}
        >
          Samuh Lagan Registration
        </Typography>

        {formDetails?.eventDate && (
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            p: 2,
            backgroundColor: colors.secondary.light,
            borderRadius: '12px',
            border: `1px solid ${colors.secondary.main}`
          }}>
            <Typography variant="h6" sx={{ color: colors.primary.main, fontWeight: 600 }}>
              Ceremony Date: {formatDate(formDetails.eventDate)}
            </Typography>
          </Box>
        )}

        {countdown && (
          <CountdownTimer elevation={0}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              width: '100%',
              justifyContent: 'center'
            }}>
              <AccessTime 
                sx={{ 
                  fontSize: 32, 
                  color: colors.primary.main,
                  mr: 2
                }} 
              />
              {countdown.split(' ').map((part, index) => {
                if (part.endsWith('d')) {
                  return (
                    <TimeUnit key="days">
                      <TimeValue>{part.replace('d', '')}</TimeValue>
                      <TimeLabel>Days</TimeLabel>
                    </TimeUnit>
                  );
                }
                if (part.endsWith('h')) {
                  return (
                    <TimeUnit key="hours">
                      <TimeValue>{part.replace('h', '')}</TimeValue>
                      <TimeLabel>Hours</TimeLabel>
                    </TimeUnit>
                  );
                }
                if (part.endsWith('m')) {
                  return (
                    <TimeUnit key="minutes">
                      <TimeValue>{part.replace('m', '')}</TimeValue>
                      <TimeLabel>Minutes</TimeLabel>
                    </TimeUnit>
                  );
                }
                if (part.endsWith('s')) {
                  return (
                    <TimeUnit key="seconds">
                      <TimeValue>{part.replace('s', '')}</TimeValue>
                      <TimeLabel>Seconds</TimeLabel>
                    </TimeUnit>
                  );
                }
                return null;
              })}
            </Box>
          </CountdownTimer>
        )}
        
        <Suspense fallback={<LoadingFallback />}>
          {!showForm ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBookClick}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Book Now
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid columns={{ xs: 12, md: 6 }}>
                  {renderFormSection('bride', 'Bride Details', bridePhotoPreview)}
                </Grid>
                <Grid columns={{ xs: 12, md: 6 }}>
                  {renderFormSection('groom', 'Groom Details', groomPhotoPreview)}
                </Grid>
                <Grid columns={{ xs: 12 }}>
                  <Box display="flex" justifyContent="center">
                    <StyledButton
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                      size="large"
                  >
                    {isSubmitting ? (
                      <>
                          <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                        Submitting...
                      </>
                    ) : (
                        'Submit Registration'
                    )}
                    </StyledButton>
                </Box>
              </Grid>
            </Grid>
          </form>
          )}
        </Suspense>
    </Box>
    </Container>
  );
};

export default SamuhLaganBooking; 