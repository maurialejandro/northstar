import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const CustomTextField: React.FC<TextFieldProps> = (props) => {
  return <TextField {...props} />;
};

export default CustomTextField;
