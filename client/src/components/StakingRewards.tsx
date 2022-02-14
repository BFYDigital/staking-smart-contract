import React, { useState, useEffect, useContext } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AppContext } from '../context';
import Web3 from 'web3';
import bfyLogo from '../bfy.png';

export default function StakingRewards() {
  const { dapp } = useContext(AppContext);
  const [bfyTokenBalance, setBfyTokenBalance] = useState<string>('0');
  const [state, setState] =
    useState<{ retrievingReward: boolean | undefined }>({ retrievingReward: false });

  useEffect(() => {
    setState({ ...state, retrievingReward: true });
    const componentInit = async () => {
      let tokenBalance = Web3.utils.fromWei(
        await dapp.stakerContract?.methods.tokenBalanceOf(dapp.accounts[0]).call(),
        'ether');
      setBfyTokenBalance(tokenBalance);
    };
    componentInit()
      .catch(console.log).finally(() => setState({ ...state, retrievingReward: false }));
  }, []);

  return (
    <Box sx={{
      my: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Typography variant="body1" >Total BFY Tokens Awarded</Typography>
      {state.retrievingReward ?
        <CircularProgress sx={{ my: 3 }} />
        :
        <>
          <Typography variant="h4" sx={{ my: 3 }}>
            {bfyTokenBalance} <img style={{ maxHeight: '20px' }} src={bfyLogo} />
          </Typography>
        </>
      }
      <Typography variant="subtitle1">stake ETH to be awarded BFY Tokens</Typography>
    </Box>
  );
}
