import { AlertColor } from '@mui/material/Alert';

declare interface ISnackbarMessage {
  isOpen: boolean;
  severity: AlertColor;
  message: string;
}
