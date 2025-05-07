import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
  title?: string;
  message: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  onNavigate,
  title = 'Success',
  message,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose} // Prevents closing by clicking outside
      aria-labelledby="success-dialog-title"
      aria-describedby="success-dialog-description"
    >
      <DialogTitle id="success-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="success-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close this window
        </Button>
        <Button onClick={onNavigate} color="primary" autoFocus>
          Visit Archive
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessDialog;
