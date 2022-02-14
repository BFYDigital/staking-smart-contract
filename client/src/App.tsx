import { useEffect, useState, useContext } from 'react';
import Staker from './contracts/Staker.json';
import { Contract } from 'web3-eth-contract';
import getWeb3 from './getWeb3';
import { AbiItem } from 'web3-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Container, CssBaseline, Tab, Tabs } from '@mui/material';
import TabPanel from './components/ui/TabPanel';
import { ConnectingWallet } from './components/wallet';
import { StakingDashboard } from './components/staking';
import { ManagementDashboard } from './components/management';
import StakingRewards from './components/StakingRewards';
import { AppContext } from './context';

function App() {

  const { dapp } = useContext(AppContext);
  const [networkId, setNetworkId] = useState<number>(-1);
  const [accounts, setAccounts] = useState<Array<string>>([]);
  const [stakerContract, setStakerContract] = useState<Contract | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  useEffect(() => {
    const web3Init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = (Staker.networks as any)[networkId];

      const contract = new web3.eth.Contract(
        Staker.abi as AbiItem[],
        deployedNetwork?.address,
      );

      // set network
      dapp.setNetworkId(networkId);
      setNetworkId(networkId);

      // set accounts
      dapp.setAccounts(accounts);
      setAccounts(accounts);

      // set staker contract
      dapp.setStakerContract(contract);
      setStakerContract(contract);
    };
    web3Init().catch(console.log);
  });

  const isApplicationLoaded = () => {
    return (stakerContract && accounts.length > 0);
  }

  function a11yProps(index: number) {
    return {
      id: `dapp-tab-${index}`,
      'aria-controls': `dapp-tabpanel-${index}`,
    };
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue);
  };

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#66afff',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: '#0a1929',
        paper: '#001e3c',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs" sx={{ backgroundColor: "#001E3C" }}>
        <CssBaseline />
        <Box sx={{ marginTop: 2, py: 2 }}>
          {!isApplicationLoaded() && <ConnectingWallet />}
          {isApplicationLoaded() && (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="staking dapp tabs">
                  <Tab label="Staking" {...a11yProps(0)} />
                  <Tab label="Rewards" {...a11yProps(1)} />
                  <Tab label="Management" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <TabPanel value={selectedTabIndex} index={0}>
                <StakingDashboard />
              </TabPanel>
              <TabPanel value={selectedTabIndex} index={1}>
                <StakingRewards />
              </TabPanel>
              <TabPanel value={selectedTabIndex} index={2}>
                <ManagementDashboard />
              </TabPanel>
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
