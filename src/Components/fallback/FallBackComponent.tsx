import { customColor } from '@/utils/customColor'
import { Box, LinearProgress } from '@mui/material'
import React from 'react'

const FallBackComponent = () => {
  return (
      <Box sx={{ width: '100%', overflow:"hidden"  }}>
      <LinearProgress sx={{position:"sticky", top:0, backgroundColor:customColor.primaryLight, ".MuiLinearProgress-bar":{backgroundColor:customColor.primary}}} />
      <Box sx={{ width:"100%", height:"100vh", display:"flex", justifyContent:"center", alignItems:"center"}}>
        <img src="/assets/images/mscorpres_auto_logo.png" alt="" style={{ width: 100, opacity:0.8,  }} />
      </Box>
    </Box>
  )
}

export default FallBackComponent