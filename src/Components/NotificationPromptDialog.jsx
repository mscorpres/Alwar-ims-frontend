import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const REASONS = [
  "Get instant alerts on approval requests",
  "Real-time stock and inventory warnings",
  "Job work and challan status updates",
  "System announcements and downtime alerts",
];

const REMINDER_COOKIE = "WPN_REMINDER";
const SNOOZE_MS = 3 * 60 * 60 * 1000; // 3 hours

function getReminderCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${REMINDER_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setReminderCookie() {
  const expiry = Date.now() + SNOOZE_MS;
  document.cookie = [
    `${REMINDER_COOKIE}=${expiry}`,
    `max-age=${SNOOZE_MS / 1000}`,
    "path=/",
    "SameSite=Strict",
    window.location.protocol === "https:" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function isSnoozed() {
  const val = getReminderCookie();
  if (!val) return false;
  return Date.now() < Number(val);
}

export default function NotificationPromptDialog({ onGranted }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);
  const [snoozed, setSnoozed] = useState(isSnoozed);

  // Auto-wake: when snooze cookie expires, show the dialog immediately
  useEffect(() => {
    if (!snoozed) return;
    const val = getReminderCookie();
    if (!val) return;
    const msLeft = Number(val) - Date.now();
    if (msLeft <= 0) { setSnoozed(false); return; }
    const timer = setTimeout(() => setSnoozed(false), msLeft);
    return () => clearTimeout(timer);
  }, [snoozed]);

  // Permissions API: auto-detects when user changes browser settings
  useEffect(() => {
    if (!navigator.permissions) return;
    let permStatus;
    navigator.permissions.query({ name: "notifications" }).then((status) => {
      permStatus = status;
      permStatus.onchange = () => setPermission(Notification.permission);
    });
    return () => {
      if (permStatus) permStatus.onchange = null;
    };
  }, []);

  useEffect(() => {
    if (permission === "granted") onGranted?.();
  }, [permission]);

  if (permission === "granted" || snoozed) return null;

  const isDenied = permission === "denied";

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = () => {
    setReminderCookie();
    setSnoozed(true);
  };

  return (
    <Dialog
      open
      disableEscapeKeyDown
      PaperProps={{
        sx: { borderRadius: 3, maxWidth: "50%", width: "100%", p: 1 },
      }}
    >
      <DialogContent>
        {/* Icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "40%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
            backgroundColor: isDenied ? "#fff1f0" : "#e6f4ff",
          }}
        >
          {isDenied ? (
            <NotificationsOffIcon sx={{ fontSize: 36, color: "#cf1322" }} />
          ) : (
            <NotificationsActiveIcon sx={{ fontSize: 36, color: "#0958d9" }} />
          )}
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight={700} textAlign="center" gutterBottom>
          {isDenied ? "Notifications Blocked" : "Enable Push Notifications"}
        </Typography>

        {isDenied ? (
          <>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2, lineHeight: 1.7 }}>
              You have blocked notifications for this site.<br />
              To continue using IMS, please enable them from your browser.
            </Typography>
            <Box
              sx={{
                background: "#fff7e6",
                border: "1px solid #ffd591",
                borderRadius: 2,
                p: 1.5,
                fontSize: 13,
                color: "#874d00",
                lineHeight: 2,
                textAlign: "center",
              }}
            >
              Click the <strong>lock icon</strong> in the address bar, find the <strong>Notifications</strong> setting, and set it to &rarr; <strong>Allow</strong>.
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1.5 }}>
              IMS needs notification permission for the following reasons:
            </Typography>

            <List dense disablePadding sx={{ mb: 1.5 }}>
              {REASONS.map((reason) => (
                <ListItem key={reason} disableGutters sx={{ py: 0.3 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 17, color: "#0958d9" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={reason}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
              Click <strong>Enable</strong> below, then click <strong>Allow</strong> when the browser asks.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, pt: 0, flexDirection: "column", gap: 1 }}>
        {isDenied ? (
          <>
            <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1 }}>
              Waiting for permission change...
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={handleSnooze}
              sx={{ color: "text.disabled", fontSize: 11 }}
            >
              Skip for now
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              size="large"
              onClick={handleEnable}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <NotificationsActiveIcon />
                )
              }
              sx={{ px: 5, borderRadius: 2, minWidth: 220 }}
            >
              {loading ? "Requesting..." : "Enable Notifications"}
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={handleSnooze}
              startIcon={<AccessTimeIcon sx={{ fontSize: 15 }} />}
              sx={{ color: "text.disabled", fontSize: 12 }}
            >
              Remind me later (3 hours)
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={handleSnooze}
              sx={{ color: "text.disabled", fontSize: 11 }}
            >
              Skip for now
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
