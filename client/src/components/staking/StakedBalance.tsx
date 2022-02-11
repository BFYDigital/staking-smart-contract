import { Box, Typography } from '@mui/material';

interface IStakedBalanceProps {
  userStakedBalance: string;
}

export default function StakedBalance({ userStakedBalance }: IStakedBalanceProps) {
  return (
    <Box sx={{
      my: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Typography variant="subtitle1">you have staked</Typography>
      <Typography variant="body2">
        {userStakedBalance} ETH
      </Typography>
    </Box>
  );
}
