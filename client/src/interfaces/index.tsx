import { AlertColor } from '@mui/material/Alert';

export interface ISnackbarMessage {
  isOpen: boolean;
  severity: AlertColor;
  message: string;
}
