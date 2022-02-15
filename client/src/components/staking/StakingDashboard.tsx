import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Divider, Stack, Snackbar, TextField, Typography, AlertColor } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ArrowUpward, ArrowDownward, Password } from '@mui/icons-material';
import Web3 from 'web3';
import { AppContext } from '../../context';
import StakingSummary from './StakingSummary';
import StakingBalance from './StakedBalance';
import StakingStatusIndicator from './StakingStatusIndicator';
import BN from 'bn.js';
import helpers from '../../utils/helpers';
import { Alert } from '../ui';
import { ISnackbarMessage } from '../../interfaces';

export default function StakingDashboard() {

  const [amount, setAmount] = useState<string>('');
  const [state, setState] =
    useState<{ isStaking?: boolean | undefined, isUnStaking: boolean | undefined }>
      ({ isStaking: false, isUnStaking: false });
  const [stakedBalance, setStakedBalance] = useState<string>('0');
  const [userStakedBalance, setUserStakedBalance] = useState<string>('0');
  const [currentStakedAmount, setCurrentStakedAmount] = useState<string>('0');
  const [stakingStatus, setStakingStatus] = useState<number>(0);
  const [snackbarMessage, setSnackbarMessage] =
    useState<ISnackbarMessage>({ isOpen: false, severity: 'success', message: '' });
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

  const canStake = (): boolean => {
    return (stakingStatus == 0); // 0 -> StakingStatus.OPEN
  };

  const canWithdraw = (): boolean => {
    return (stakingStatus == 1); // 1 -> StakingStatus.CLOSED
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const stakeAction = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (!amount || parseFloat(amount) <= 0) {
      openSnackBar('warning', 'please specify an amount more than 0');
      return;
    }

    setState({ ...state, isStaking: true });
    let value = Web3.utils.toWei(amount ? amount : '0.1', 'ether');
    dapp.stakerContract?.methods
      .stake().send({ from: dapp.accounts[0], value: value })
      .then(() => {
        // reset amount field
        setAmount('');
        // change current staked amount to trigger effect
        setCurrentStakedAmount(new BN(currentStakedAmount).add(new BN(amount)).toString());

        // display snackbar with success message
        openSnackBar('success', `you have successfully staked ${amount} ETH`);
      })
      .catch(console.log)
      .finally(setState({ ...state, isStaking: false }));
  };

  const withdrawAction = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setState({ ...state, isUnStaking: true });
    dapp.stakerContract?.methods
      .withdraw().send({ from: dapp.accounts[0] })
      .then(() => {
        // set current staked amount to zero
        setCurrentStakedAmount(new BN(0).toString());

        // display snackbar with success message
        openSnackBar('success', 'you have successfully withdrawn all your ETH');
      })
      .catch((error: Error) => {
        console.log(error);
        // get the error message
        let message: string = helpers.extractTruffleErrorMessage(error);

        // display snackbar with error message
        openSnackBar('error', `could not withdraw your staked ETH. Reason: ${message}`);
      })
      .finally(setState({ ...state, isUnStaking: false }));
  };

  const openSnackBar = (type: AlertColor, message: string): void => {
    setSnackbarMessage({ isOpen: true, severity: type, message: message });
  }

  const handleSnackbarClose = () => {
    setSnackbarMessage({ ...snackbarMessage, isOpen: false });
  };

  return (
    <>
      <Box sx={{ my: 1 }}>
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
        <TextField
          disabled={!canStake()}
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
          {canStake() ?
            <LoadingButton
              loading={state.isStaking}
              disabled={state.isUnStaking}
              onClick={stakeAction} type="button"
              size="large"
              variant="contained"
              color="success"
              startIcon={<ArrowUpward />}
            >
              Skate ETH
            </LoadingButton>
            :
            <>
              <Button
                disabled={true}
                type="button"
                size="large"
                variant="contained"
                color="success"
                startIcon={<ArrowUpward />}
              >
                Skate ETH
              </Button>
              <Typography
                align="center"
                variant="subtitle2">staking is not open</Typography>
            </>
          }

          <Divider />

          {canWithdraw() ?
            <LoadingButton
              loading={state.isUnStaking}
              disabled={state.isStaking}
              onClick={withdrawAction}
              size="large"
              type="button"
              variant="contained"
              color="error"
              startIcon={<ArrowDownward />}
            >
              Withdraw
            </LoadingButton>
            :
            <>
              <Button
                disabled={true}
                size="large"
                type="button"
                variant="contained"
                color="error"
                startIcon={<ArrowDownward />}
              >
                Withdraw
              </Button>
              <Typography
                align="center"
                variant="subtitle2">to withdraw, staking must be closed</Typography>
            </>
          }
        </Stack>
      </Box>
    </>
  );
}
