import React from 'react';
import { Button, ButtonProps, SxProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  customSx?: SxProps;
}

const CustomButton: React.FC<CustomButtonProps> = ({ customSx, ...props }) => {
  return (
    <Button
      {...props}
      sx={{
        backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
        color: '#000000',
        padding: '0px',
        height: 'auto',
        width: 'auto',
        ...customSx,
      }}
    />
  );
};

export default CustomButton;