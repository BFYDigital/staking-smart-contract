import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function ConnectingWallet() {

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 3 }}>
        Loading Web3, accounts, and contract...
      </Typography>
    </Box>
  );
}
