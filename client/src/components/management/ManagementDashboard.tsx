import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Divider, Stack, Snackbar, TextField } from '@mui/material';
import { Cancel, Done, ThumbUpAlt, RestartAlt } from '@mui/icons-material';
import { AppContext } from '../../context';
import StakingStatusIndicator from '../staking/StakingStatusIndicator';

export default function ManagementDashboard() {

  const DEFAULT_ADDERSS = '0x0';
  const { dapp } = useContext(AppContext);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [ownerAddress, setOwnerAddress] = useState<string>('');
  const [stakingStatus, setStakingStatus] = useState<number>(0);
  const [triggerRerender, setTriggerRerender] = useState<boolean>(false);
  const [awardeeAddress, setAwardeeAddress] = useState<string>(DEFAULT_ADDERSS);

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
    updateStakingStatus();
  }, [triggerRerender]);

  const completeStakingAction = async (): Promise<void> => {
    await dapp.stakerContract?.methods.completeStaking().send({ from: dapp.accounts[0] });
    setTriggerRerender(!triggerRerender);
  };

  const closeStakingAction = async (): Promise<void> => {
    await dapp.stakerContract?.methods.closeStaking().send({ from: dapp.accounts[0] });
    setTriggerRerender(!triggerRerender);
  };

  const restartStakingAction = async (): Promise<void> => {
    await dapp.stakerContract?.methods.restartStaking().send({ from: dapp.accounts[0] });
    setTriggerRerender(!triggerRerender);
  };

  const handleAwardeeAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAwardeeAddress(event.target.value);
  };

  const rewardStakeAction = async (): Promise<void> => {
    await dapp.stakerContract?.methods
      .awardStakedBalance(awardeeAddress)
      .send({ from: dapp.accounts[0] });

    setAwardeeAddress(DEFAULT_ADDERSS);
    setTriggerRerender(!triggerRerender);
  };

  return (
    <>
      {!isOwner && <div>ONLY THE OWNER CAN USE THIS PANEL</div>}
      {isOwner &&
        <Box sx={{ my: 1 }}>
          <Stack spacing={2}>
            <StakingStatusIndicator status={stakingStatus} />
            <Divider />
            <Button
              onClick={completeStakingAction} type="button"
              variant="outlined"
              color="primary"
              startIcon={<Done />}
            >
              Complete Staking
            </Button>

            <Button
              onClick={closeStakingAction} type="button"
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
            >
              Close Staking
            </Button>

            <Button
              onClick={restartStakingAction} type="button"
              variant="outlined"
              color="secondary"
              startIcon={<RestartAlt />}
            >
              Restart Staking
            </Button>
          </Stack>
          <Divider />
          <Box sx={{ my: 1 }}>
            <TextField
              onChange={handleAwardeeAddressChange}
              value={awardeeAddress}
              margin="normal"
              required
              fullWidth
              id="stakeAmount"
              label="Amount"
              name="stakeAmount"
              autoFocus
            />
            <Button
              onClick={rewardStakeAction} type="button"
              variant="contained"
              size="large"
              color="success"
              startIcon={<ThumbUpAlt />}
            >
              Award Address
            </Button>
          </Box>
        </Box>
      }
    </>
  );
}
