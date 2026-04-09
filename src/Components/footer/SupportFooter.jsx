import { Calculate, Chat, Feedback } from '@mui/icons-material';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import { IconButton, Tooltip, Typography } from '@mui/material';

const SupportFooter = () => {
  return (
    <div
      style={{
  
        width: "100%",
        backgroundColor: "white",
        padding: "2px 15px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        zIndex: 9999,
    
      }}
    >
  <Tooltip title="Support">
  <IconButton size="small">
    <HeadsetMicIcon style={{fontSize:14}}/>
  </IconButton>
  </Tooltip>
    <Tooltip title="Chat with us">
  <IconButton size="small">
    <Chat style={{fontSize:14}}/>
  </IconButton>
  </Tooltip>
    {/* <Tooltip title="Calculater">
  <IconButton size="small">
    <Calculate style={{fontSize:14}}/>
  </IconButton>
  </Tooltip> */}
    <Tooltip title="Feedback">
  <IconButton size="small">
    <Feedback style={{fontSize:14}}/>
  </IconButton>
  </Tooltip>

    </div>
  );
};

export default SupportFooter;
