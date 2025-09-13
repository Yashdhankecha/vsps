import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close as CloseIcon, Announcement as AnnouncementIcon } from '@mui/icons-material';
import { AccessTime } from '@mui/icons-material';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '500px',
    width: '95%',
    margin: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(124, 58, 237, 0.1)',
    overflow: 'hidden',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(4px)',
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(-20px) scale(0.95)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2.5, 3),
  '& .MuiIconButton-root': {
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  padding: '10px 32px',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#6d28d9',
  },
  '&.MuiButton-outlined': {
    borderColor: '#7c3aed',
    color: '#7c3aed',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(124, 58, 237, 0.04)',
      borderColor: '#6d28d9',
    },
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  '& .MuiTypography-h6': {
    color: '#1f2937',
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  '& .MuiTypography-body1': {
    color: '#4b5563',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  '& .MuiTypography-body2': {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

const defaultFormData = {
  title: 'Form Registration',
  message: 'Registration is now open. Please fill the form before the deadline.',
  route: '/',
  deadline: null
};

const NoticeModal = ({ 
  open = false, 
  onClose = () => {}, 
  formData = null
}) => {
  const navigate = useNavigate();
  const data = formData || defaultFormData;

  const handleOpenForm = () => {
    onClose();
    navigate(data.route);
  };

  if (!open) {
    return null;
  }

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="notice-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <StyledDialogTitle id="notice-dialog-title">
        <AnnouncementIcon sx={{ fontSize: 24 }} />
        <Typography 
          variant="h6" 
          component="span" 
          sx={{ 
            flexGrow: 1, 
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          Important Notice from Samaj
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ 
            width: 34, 
            height: 34,
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </StyledDialogTitle>

      <ContentBox>
        <Typography variant="h6">
          {data.title}
        </Typography>
        <Typography variant="body1">
          {data.message}
        </Typography>
        {data.deadline && (
          <Typography variant="body2">
            <AccessTime sx={{ fontSize: 18 }} />
            Deadline: {new Date(data.deadline).toLocaleDateString()}
          </Typography>
        )}
      </ContentBox>

      <DialogActions 
        sx={{ 
          padding: 3, 
          paddingTop: 0,
          gap: 2,
          justifyContent: 'flex-end'
        }}
      >
        <StyledButton
          onClick={onClose}
          variant="outlined"
        >
          Dismiss
        </StyledButton>
        <StyledButton
          onClick={handleOpenForm}
          variant="contained"
          disableElevation
        >
          Open Form
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default NoticeModal; 