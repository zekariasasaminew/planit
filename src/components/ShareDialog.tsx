import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Share, ContentCopy, CheckCircle } from "@mui/icons-material";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  onShare: (isPublic: boolean) => Promise<string>;
  planName: string;
  loading?: boolean;
}

export function ShareDialog({
  open,
  onClose,
  onShare,
  planName,
  loading = false,
}: ShareDialogProps) {
  const [isPublic, setIsPublic] = React.useState(true);
  const [shareUrl, setShareUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    try {
      const url = await onShare(isPublic);
      setShareUrl(url);
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleCopyUrl = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShareUrl("");
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Share />
          Share Plan
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Create a shareable link for &quot;{planName}&quot;:
        </Typography>

        {!shareUrl ? (
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <FormLabel component="legend">Sharing Options</FormLabel>
            <RadioGroup
              value={isPublic ? "public" : "private"}
              onChange={(e) => setIsPublic(e.target.value === "public")}
            >
              <FormControlLabel
                value="public"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Public Link</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Anyone with the link can view the plan
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="private"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Private Link</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only people you share the link with can view
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your share link is ready! Copy and share with others:
            </Typography>
            <TextField
              fullWidth
              value={shareUrl}
              variant="outlined"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleCopyUrl}
                      edge="end"
                      color={copied ? "success" : "default"}
                    >
                      {copied ? <CheckCircle /> : <ContentCopy />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {copied && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Link copied to clipboard!
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{shareUrl ? "Close" : "Cancel"}</Button>
        {!shareUrl && (
          <Button onClick={handleShare} variant="contained" disabled={loading}>
            {loading ? "Creating Link..." : "Create Share Link"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
