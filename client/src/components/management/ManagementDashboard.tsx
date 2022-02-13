import React, { useState, useEffect, useContext } from 'react';
import { Alert, AlertColor, AlertTitle, Box, Divider, Snackbar, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Cancel, Close, Done, RestartAlt } from '@mui/icons-material';
import { AppContext } from '../../context';
import StakingStatusIndicator from '../staking/StakingStatusIndicator';
import Web3 from 'web3';
import BN from 'bn.js';
import { ISnackbarMessage } from '../../interfaces';
import helpers from '../../utils/helpers';

interface IState {
  isCompleting: boolean | undefined;
  isClosing: boolean | undefined;
  isRestarting: boolean | undefined;
  isTerminating: boolean | undefined;
}

export default function ManagementDashboard() {
  const { dapp } = useContext(AppContext);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [ownerAddress, setOwnerAddress] = useState<string>('');
  const [stakingStatus, setStakingStatus] = useState<number>(0);
  const [triggerRerender, setTriggerRerender] = useState<boolean>(false);
  const [state, setState] = useState<IState>(
    { isCompleting: false, isClosing: false, isRestarting: false, isTerminating: false });
  const [stakedBalance, setStakedBalance] = useState<string>('0');
  const [thresholdReached, setThresholdReached] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] =
    useState<ISnackbarMessage>({ isOpen: false, severity: 'success', message: '' });

  const updateStakingStatus = async (): Promise<void> => {
    let _stakingStatus: number = parseInt(await dapp.stakerContract?.methods.getStatus().call());
    setStakingStatus(_stakingStatus);
  };

  useEffect(() => {
    const componentInit = async () => {
      // get contract owner address
      let address: string = await dapp.stakerContract?.methods.owner().call();
      setOwnerAddress(address);
      setIsOwner(address === dapp.accounts[0]);

      // get and update the staking status
      updateStakingStatus();
    };
    componentInit().catch(console.log);
  }, []);

  useEffect(() => {
    const getStakedBalance = async () => {
      // get total amount staked
      let _stakedBalance = Web3.utils.fromWei(
        await dapp.stakerContract?.methods.getTotalStakedAmount().call(), 'ether');
      setStakedBalance(_stakedBalance);

      // check if staking threshold has been reached
      let _thresholdReached = new BN(_stakedBalance)
        .gte(new BN(1));
      setThresholdReached(_thresholdReached);
    };
    getStakedBalance().catch(console.log);

    updateStakingStatus();
  }, [triggerRerender]);

  const completeStakingAction = (): void => {

    if (!thresholdReached) {
      // display snackbar with warning message
      openSnackBar('warning', 'Cannot complete staking. Threshold has not been reached');
      return;
    }

    setState({ ...state, isCompleting: true });
    dapp.stakerContract?.methods.completeStaking().send({ from: dapp.accounts[0] })
      .then(() => {
        // display snackbar with success message
        openSnackBar('success', 'Staking completed. BFY Tokens have been awarded');
      })
      .catch((error: Error) => {
        // extract reason and display snackbar with error message
        let reason = helpers.extractTruffleErrorMessage(error);
        openSnackBar('error', `unable to close staking. Reason: ${reason}`);
      })
      .finally(() => {
        setState({ ...state, isCompleting: false });
        setTriggerRerender(!triggerRerender);
      });
  };

  const closeStakingAction = (): void => {
    setState({ ...state, isClosing: true });
    dapp.stakerContract?.methods.closeStaking().send({ from: dapp.accounts[0] })
      .then(() => {
        // display snackbar with info message
        openSnackBar('info', 'Staking has been closed. Stakers can now withdraw their ETH');
      })
      .catch((error: Error) => {
        // extract reason and display snackbar with error message
        let reason = helpers.extractTruffleErrorMessage(error);
        openSnackBar('error', `unable to close staking. Reason: ${reason}`);
      })
      .finally(() => {
        setState({ ...state, isClosing: false });
        setTriggerRerender(!triggerRerender);
      });
  };

  const restartStakingAction = (): void => {
    setState({ ...state, isRestarting: true });
    dapp.stakerContract?.methods.restartStaking().send({ from: dapp.accounts[0] })
      .then(() => {
        // display snackbar with info message
        openSnackBar('success', 'Staking has successfully been restarted.');
      })
      .catch((error: Error) => {
        // extract reason and display snackbar with error message
        let reason = helpers.extractTruffleErrorMessage(error);
        openSnackBar('error', `unable to close staking. Reason: ${reason}`);
      })
      .finally(() => {
        setState({ ...state, isRestarting: false });
        setTriggerRerender(!triggerRerender);
      });
  };

  const terminateContractAction = (): void => {
    setState({ ...state, isTerminating: true });
    dapp.stakerContract?.methods.terminateContract().send({ from: dapp.accounts[0] })
      .then(() => {
        // display snackbar with info message
        openSnackBar('warning', `
        Staking has been terminated! 
        This contract is no longer the owner of the BFY Token contract!`);
      })
      .catch((error: Error) => {
        // extract reason and display snackbar with error message
        let reason = helpers.extractTruffleErrorMessage(error);
        openSnackBar('error', `unable to close staking. Reason: ${reason}`);
      })
      .finally(() => {
        setState({ ...state, isTerminating: false });
        setTriggerRerender(!triggerRerender);
      });
  };

  const canCompleteSkating = (): boolean => {
    return (stakingStatus == 0); // 0 -> StakingStatus.OPEN
  };

  const canCloseStaking = (): boolean => {
    return canCompleteSkating();
  }

  const canRestartStaking = (): boolean => {
    return (stakingStatus == 1 || stakingStatus == 2);
  };

  const canTerminateContract = (): boolean => {
    return canRestartStaking();
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
        {!isOwner &&
          <>
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              ONLY THE <strong>OWNER</strong> CAN USE THIS PANEL
            </Alert>
          </>}
        {isOwner &&
          <>
            <Snackbar open={snackbarMessage.isOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
              <Alert onClose={handleSnackbarClose} severity={snackbarMessage.severity} sx={{ width: '100%' }}>
                {snackbarMessage.message}
              </Alert>
            </Snackbar>
            <Stack spacing={2} sx={{ my: 2 }}>
              <StakingStatusIndicator status={stakingStatus} />
              <Divider />
              <Typography style={{ fontWeight: 'bold' }} variant="subtitle1" align="center">
                update staking status
              </Typography>
            </Stack>
            <Stack alignItems="center" justifyContent="center" spacing={2} direction="row">
              <LoadingButton
                onClick={completeStakingAction}
                loading={state.isCompleting}
                disabled={!canCompleteSkating()}
                type="button"
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<Done />}
              >Complete</LoadingButton>

              <LoadingButton
                onClick={closeStakingAction}
                loading={state.isClosing}
                disabled={!canCloseStaking()}
                type="button"
                variant="contained"
                color="warning"
                size="medium"
                startIcon={<Close />}
              >Close</LoadingButton>

              <LoadingButton
                onClick={restartStakingAction}
                loading={state.isRestarting}
                disabled={!canRestartStaking()}
                type="button"
                variant="contained"
                color="secondary"
                size="medium"
                startIcon={<RestartAlt />}
              >Restart</LoadingButton>
            </Stack>

            <Stack sx={{ mt: 2 }} spacing={2}>
              <Divider />

              <LoadingButton
                onClick={terminateContractAction}
                disabled={!canTerminateContract()}
                type="button"
                variant="contained"
                color="error"
                size="large"
                startIcon={<Cancel />}
              >
                Terminate Contract
              </LoadingButton>

              <Typography variant="subtitle1" align="center">
                warning! terminating the contract will move ownership
                of BFY Token to the owner of this contract <strong>({ownerAddress})</strong>
              </Typography>
            </Stack>
          </>
        }
      </Box>
    </>
  );
}
