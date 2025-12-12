import React from 'react';
import { Box, Typography } from '@mui/material';

const UserImage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Image Management
      </Typography>
      <Typography variant="body1">
        User image management functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default UserImage;
