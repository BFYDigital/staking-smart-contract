import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Divider, Stack, Snackbar, TextField } from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import Web3 from 'web3';
import { AppContext } from '../../context';
import StakingSummary from './StakingSummary';
import StakingBalance from './StakedBalance';
import StakingStatusIndicator from './StakingStatusIndicator';
import BN from 'bn.js';
import helpers from '../../utils/helpers';
import { Alert } from '../ui';

interface ISnackbarMessage {
  isOpen: boolean;
  severity: AlertColor;
  message: string;
}

export default function StakingDashboard() {

  const [amount, setAmount] = useState<string>('');
  const [state, setState] =
    useState<{ isStaking: Boolean, isUnStaking: Boolean }>
      ({ isStaking: false, isUnStaking: false });
  const [stakedBalance, setStakedBalance] = useState<string>('0');
  const [userStakedBalance, setUserStakedBalance] = useState<string>('0');
  const [currentStakedAmount, setCurrentStakedAmount] = useState<string>('0');
  const [stakingStatus, setStakingStatus] = useState<number>(0);
  const [snackbarMessage, setSnackbarMessage] = useState<ISnackbarMessage>({
    isOpen: false,
    severity: 'success',
    message: ''
  });
  const { dapp } = useContext(AppContext);

  useEffect(() => {
    const componentInit = async () => {

      // get total amount staked
      let _stakedBalance = Web3.utils.fromWei(
        await dapp.stakerContract?.methods.getTotalStakedAmount().call(), 'ether');
      setStakedBalance(_stakedBalance);

      // get the amount the user staked
      let _userStakedBalance = Web3.utils.fromWei(
        await dapp.stakerContract?.methods.getUserStakedAmount(dapp.accounts[0]).call(), 'ether');
      setUserStakedBalance(_userStakedBalance);

      // get the staking status
      let _stakingStatus: number = parseInt(await dapp.stakerContract?.methods.getStatus().call());
      setStakingStatus(_stakingStatus);
    };
    componentInit().catch(console.log);
  }, [currentStakedAmount]);

  // TODO: hookup to the withdraw button
  const canWithdraw = (): boolean => {
    return (stakingStatus == 1); // 1 -> StakingStatus.CLOSED
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const stakeAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    setState({ ...state, isStaking: true });

    let value = Web3.utils.toWei(amount ? amount : '0', 'ether');
    dapp.stakerContract?.methods
      .stake().send({ from: dapp.accounts[0], value: value })
      .then(() => {
        // reset amount field
        setAmount('');
        // change current staked amount to trigger effect
        setCurrentStakedAmount(new BN(currentStakedAmount).add(new BN(amount)).toString());

        // display snackbar with success message
        setSnackbarMessage({
          isOpen: true,
          severity: 'success',
          message: `you have successfully staked ${amount} ETH`
        });
      })
      .catch(console.log)
      .finally(setState({ ...state, isStaking: false }));
  };

  const unWithdrawAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    setState({ ...state, isStaking: true });

    dapp.stakerContract?.methods
      .withdraw().send({ from: dapp.accounts[0] })
      .then(() => {
        // set current staked amount to zero
        setCurrentStakedAmount(new BN(0).toString());

        // display snackbar with success message
        setSnackbarMessage({
          isOpen: true,
          severity: 'success',
          message: 'you have successfully withdrawn all your ETH'
        });
      })
      .catch((error: Error) => {
        console.log(error);
        // get the error message
        let message: string = helpers.extractTruffleErrorMessage(error);

        // display snackbar with error message
        setSnackbarMessage({
          isOpen: true,
          severity: 'error',
          message: `could not withdraw your staked ETH. Reason: ${message}`
        });
      })
      .finally(setState({ ...state, isStaking: false }));
  };

  const handleSnackbarClose = () => {
    setSnackbarMessage({ ...snackbarMessage, isOpen: false });
  };

  return (
    <>
      <Snackbar open={snackbarMessage.isOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarMessage.severity} sx={{ width: '100%' }}>
          {snackbarMessage.message}
        </Alert>
      </Snackbar>
      <Stack spacing={2}>
        <StakingSummary stakedBalance={stakedBalance} />
        <Divider />
        <StakingStatusIndicator status={stakingStatus} />
        <Divider />
        <StakingBalance userStakedBalance={userStakedBalance} />
      </Stack>
      <Box sx={{ my: 1 }}>
        <TextField
          onChange={handleAmountChange}
          value={amount}
          margin="normal"
          required
          fullWidth
          id="stakeAmount"
          label="Amount"
          name="stakeAmount"
          autoFocus
        />
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Button
            onClick={stakeAction} type="button"
            size="large"
            variant="contained"
            color="success"
            startIcon={<ArrowUpward />}
          >
            Skate ETH
          </Button>
          <Button
            onClick={unWithdrawAction}
            size="large"
            type="button"
            variant="contained"
            color="error"
            startIcon={<ArrowDownward />}
          >
            Withdraw
          </Button>
        </Stack>
      </Box>
    </>
  );
}
