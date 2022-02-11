import React, { useState, useEffect, useContext } from 'react';
import { Alert, Box, List, ListItem, Divider, ListItemText, Typography } from '@mui/material';
import { AppContext } from '../context';
import Web3 from 'web3';

interface IRecipient {
  address: string;
  amount: string;
}

export default function PastRecipients() {

  const { dapp } = useContext(AppContext);
  const [entries, setEntries] = useState<Array<IRecipient>>([]);

  useEffect(() => {
    const componentInit = async () => {
      // get list of past recieients
      let _entriesArray = await dapp.stakerContract?.methods.getPastReceivers().call();
      let _entries: Array<IRecipient> = _entriesArray.map((element: Array<string>) => {
        return {
          address: element[0],
          amount: Web3.utils.fromWei(element[1], 'ether'),
        } as IRecipient;
      });
      setEntries(_entries)
    };
    componentInit().catch(console.log);
  }, []);

  return (
    <Box
      sx={{ my: 1, width: '100%' }}>
      <List sx={{ width: '100%' }}>
        {!entries.length && <Alert severity="info">there are currently no recipients</Alert>}
        {entries.length > 0 && entries.map((entry, index) => (
          <>
            <ListItem alignItems="flex-start">
              <ListItemText
                key={index}
                primary={entry.address}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline', mr: 1 }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      amount:
                    </Typography>
                    {`${entry.amount}ETH`}
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider component="li" />
          </>
        ))}
      </List>
    </Box>
  );
}
