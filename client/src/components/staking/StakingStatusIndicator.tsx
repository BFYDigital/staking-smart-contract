import { useEffect, useState } from 'react';
import { Chip, Stack, Typography } from '@mui/material';

interface IStakingStatusIndicatorProp {
  status: number;
}

export default function StakingStatusIndicator({ status }: IStakingStatusIndicatorProp) {

  const [label, setLabel] = useState<string>('');
  const [color, setColor] = useState<any>('default');

  useEffect(() => {
    let _label: string = '';
    let _color: string = 'primary';

    switch (status) {
      case 0:
        _label = 'OPEN';
        _color = 'primary';
        break;
      case 1:
        _label = 'CLOSED';
        _color = 'error';
        break;
      case 2:
        _label = 'COMPLETED';
        _color = 'secondary';
        break;
      case 3:
        _label = 'AWARDED';
        _color = 'success';
        break;
      default:
        throw `unknown status number "${status}"`;
    }

    setLabel(_label);
    setColor(_color);
  }, [status]);


  return (
    <Stack sx={{ my: 1 }} spacing={1} alignItems="center" >
      <Typography variant="subtitle1">staking status</Typography>
      <Chip label={label} color={color} />
    </Stack>
  );
}