import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import { message } from "antd";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  getDefaultApiUrl,
  resetApiBaseUrl,
  getSavedUrls,
  saveUrl,
} from "../utils/config";

const SelectEndPoint = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [defaultUrl, setDefaultUrl] = useState("");
  const [savedUrls, setSavedUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load current API URL and default URL
    const currentUrl = getApiBaseUrl();
    const defaultApiUrl = getDefaultApiUrl();
    const saved = getSavedUrls();
    setApiUrl(currentUrl);
    setDefaultUrl(defaultApiUrl);
    setSavedUrls(saved);
  }, []);

  const handleSave = () => {
    if (!apiUrl.trim()) {
      message.error("API URL cannot be empty");
      return;
    }

    // Basic URL validation
    try {
      new URL(apiUrl);
    } catch (error) {
      message.error(
        "Please enter a valid URL (e.g., http://localhost:3000 or https://api.example.com)"
      );
      return;
    }

    setIsSaving(true);
    try {
      setApiBaseUrl(apiUrl);
      saveUrl(apiUrl);
      setSavedUrls(getSavedUrls());
      setShowSuccess(true);
      message.success("Backend URL saved successfully! Page will reload...");

      // Reload page after 2 seconds to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      message.error("Failed to save settings");
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultApiUrl = getDefaultApiUrl();
    setApiUrl(defaultApiUrl);
    resetApiBaseUrl();
    setSavedUrls(getSavedUrls());
    message.success("Backend URL reset to default! Page will reload...");
    setShowSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleCopyDefault = () => {
    navigator.clipboard.writeText(defaultUrl);
    message.success("Default URL copied to clipboard");
  };

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(apiUrl);
    message.success("Current URL copied to clipboard");
  };

  const handleSelectSavedUrl = (url: string) => {
    setApiUrl(url);
  };

  const handleAddNewUrl = () => {
    if (!apiUrl.trim()) {
      message.error("Please enter a URL first");
      return;
    }
    try {
      new URL(apiUrl);
      saveUrl(apiUrl);
      setSavedUrls(getSavedUrls());
      message.success("URL added to saved list");
    } catch (error) {
      message.error("Please enter a valid URL");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 95px)",
        width: "100%",
        padding: 3,
        background: "linear-gradient(to bottom right, #f0f9ff, #ffffff)",
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <SettingsIcon sx={{ fontSize: 32, color: "#0d9489" }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#1e293b" }}>
              Settings
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", ml: 6 }}>
            Configure application settings and preferences
          </Typography>
        </Box>

        {/* Success Alert */}
        {showSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setShowSuccess(false)}
          >
            Settings saved successfully! The new backend URL will be used for all
            API requests.
          </Alert>
        )}

        {/* Settings Card */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3, color: "#1e293b" }}
          >
            Backend Configuration
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Main URL Display */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1, color: "#475569" }}
            >
              Main Backend URL (Currently Active)
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: "#0d9489",
                borderRadius: 1,
                color: "white",
                mb: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  wordBreak: "break-all",
                }}
              >
                {apiUrl || "Not configured"}
              </Typography>
            </Box>
          </Box>

          {/* Current API URL Input */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1, color: "#475569" }}
            >
              Backend API URL
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", mb: 2, display: "block" }}
            >
              Enter the base URL for your backend API. This will be used for all
              API requests. Make sure to include the protocol (http:// or
              https://) and port if needed.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com"
                variant="outlined"
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopyCurrent}
                        edge="end"
                        size="small"
                        title="Copy current URL"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              />
              <IconButton
                onClick={handleAddNewUrl}
                sx={{
                  backgroundColor: "#f1f5f9",
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                  },
                }}
                title="Add to saved URLs"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Saved URLs Selector */}
          {savedUrls.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#475569" }}
              >
                Select from Saved URLs
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Choose a saved URL</InputLabel>
                <Select
                  value=""
                  onChange={(e) => handleSelectSavedUrl(e.target.value)}
                  label="Choose a saved URL"
                  sx={{
                    backgroundColor: "#f8fafc",
                  }}
                >
                  {savedUrls.map((url, index) => (
                    <MenuItem key={index} value={url}>
                      {url}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Default API URL Info */}
          {defaultUrl && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f1f5f9",
                borderRadius: 1,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "#475569",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Default URL (from environment)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontFamily: "monospace" }}
                  >
                    {defaultUrl || "Not configured"}
                  </Typography>
                </Box>
                <IconButton
                  onClick={handleCopyDefault}
                  size="small"
                  title="Copy default URL"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
              sx={{
                backgroundColor: "#0d9489",
                "&:hover": {
                  backgroundColor: "#0f766e",
                },
                px: 3,
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              sx={{
                borderColor: "#cbd5e1",
                color: "#475569",
                "&:hover": {
                  borderColor: "#94a3b8",
                  backgroundColor: "#f8fafc",
                },
                px: 3,
              }}
            >
              Reset to Default
            </Button>
          </Box>

          {/* Info Box */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: "#eff6ff",
              borderRadius: 1,
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <Typography variant="body2" sx={{ color: "#1e40af" }}>
              <strong>Note:</strong> After changing the backend URL, you may need
              to refresh the page or log out and log back in for the changes to
              take full effect. All API requests will use the new URL immediately
              after saving.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SelectEndPoint;
