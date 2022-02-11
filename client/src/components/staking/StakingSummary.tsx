import { Box, Typography } from '@mui/material';

interface IStakingSummaryProps {
  stakedBalance: string;
}

export default function StakingSummary({ stakedBalance }: IStakingSummaryProps) {
  return (
    <Box sx={{
      my: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Typography variant="h5" >STAKING dAPP</Typography>
      <Typography variant="subtitle1">total amount staked</Typography>
      <Typography variant="body1">
        {stakedBalance} ETH
      </Typography>
    </Box>
  );
}
