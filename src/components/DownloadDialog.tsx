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
} from "@mui/material";
import { Download } from "@mui/icons-material";

interface DownloadDialogProps {
  open: boolean;
  onClose: () => void;
  onDownload: (format: "pdf" | "csv" | "json") => void;
  planName: string;
  loading?: boolean;
}

export function DownloadDialog({
  open,
  onClose,
  onDownload,
  planName,
  loading = false,
}: DownloadDialogProps) {
  const [format, setFormat] = React.useState<"pdf" | "csv" | "json">("pdf");

  const handleDownload = () => {
    onDownload(format);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Download />
          Download Plan
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Choose the format for downloading &quot;{planName}&quot;:
        </Typography>

        <FormControl component="fieldset">
          <FormLabel component="legend">Export Format</FormLabel>
          <RadioGroup
            value={format}
            onChange={(e) =>
              setFormat(e.target.value as "pdf" | "csv" | "json")
            }
          >
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">PDF</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Formatted document ready for printing
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="csv"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">CSV</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Spreadsheet format for data analysis
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="json"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">JSON</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Machine-readable data format
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDownload} variant="contained" disabled={loading}>
          {loading ? "Downloading..." : "Download"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
