"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Fab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  BookmarkBorder,
  MoreVert,
  Edit,
  Delete,
  Share,
  Download,
  Add,
  Visibility,
  ContentCopy,
  DriveFileRenameOutline,
} from "@mui/icons-material";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DownloadDialog, ShareDialog, ConfirmationDialog } from "@/components";
import { usePlanActions } from "@/hooks/usePlanActions";
import { AcademicPlan } from "@/types";

function SavedPlansContent() {
  const router = useRouter();
  const [plans, setPlans] = useState<AcademicPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlan, setSelectedPlan] = useState<AcademicPlan | null>(null);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  // Loading states for individual actions
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});

  // Form states
  const [newPlanName, setNewPlanName] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const planActions = usePlanActions({
    onPlanUpdated: (updatedPlan) => {
      setPlans(prevPlans => prevPlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    },
    onPlanCreated: (newPlan) => {
      setPlans(prevPlans => [newPlan, ...prevPlans]); // Add to the beginning of the list
    },
    onPlanDeleted: (planId) => {
      setPlans(prevPlans => prevPlans.filter((p) => p.id !== planId));
    },
    onError: (message) => {
      setSnackbar({ open: true, message, severity: "error" });
    },
    onSuccess: (message) => {
      setSnackbar({ open: true, message, severity: "success" });
    },
  });

  // Helper function to manage action loading states
  const setActionLoadingState = (actionKey: string, loading: boolean) => {
    setActionLoading((prev) => ({
      ...prev,
      [actionKey]: loading,
    }));

    // Add haptic feedback when action starts
    if (loading && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/plans");
        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    plan: AcademicPlan
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedPlan here - let individual dialog handlers manage it
  };

  const handleViewPlan = (plan: AcademicPlan) => {
    const actionKey = `view-${plan.id}`;
    setActionLoadingState(actionKey, true);

    // Show immediate feedback
    setSnackbar({
      open: true,
      message: `Opening ${plan.name}...`,
      severity: "success",
    });

    // Execute action immediately
    planActions.viewPlan(plan);
    setActionLoadingState(actionKey, false);
  };

  const handleEditPlan = () => {
    if (selectedPlan) {
      const actionKey = `edit-${selectedPlan.id}`;
      setActionLoadingState(actionKey, true);

      setSnackbar({
        open: true,
        message: `Preparing to edit ${selectedPlan.name}...`,
        severity: "success",
      });

      // Close menu and execute action immediately
      handleMenuClose();
      planActions.editPlan(selectedPlan);
      setActionLoadingState(actionKey, false);
    }
  };

  const handleDeletePlan = () => {
    if (selectedPlan) {
      setSnackbar({
        open: true,
        message: `Preparing to delete ${selectedPlan.name}...`,
        severity: "success",
      });
    }
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleRenamePlan = () => {
    if (selectedPlan) {
      setNewPlanName(selectedPlan.name);
      setSnackbar({
        open: true,
        message: `Preparing to rename ${selectedPlan.name}...`,
        severity: "success",
      });
      setRenameDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSharePlan = () => {
    if (selectedPlan) {
      setSnackbar({
        open: true,
        message: `Preparing to share ${selectedPlan.name}...`,
        severity: "success",
      });
    }
    setShareDialogOpen(true);
    handleMenuClose();
  };

  const handleDownloadPlan = () => {
    if (selectedPlan) {
      setSnackbar({
        open: true,
        message: `Preparing to download ${selectedPlan.name}...`,
        severity: "success",
      });
    }
    setDownloadDialogOpen(true);
    handleMenuClose();
  };

  const handleDuplicatePlan = () => {
    if (selectedPlan) {
      setSnackbar({
        open: true,
        message: `Preparing to duplicate ${selectedPlan.name}...`,
        severity: "success",
      });
    }
    setDuplicateDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedPlan) {
      try {
        await planActions.deletePlan(selectedPlan.id);
        setDeleteDialogOpen(false);
        setSelectedPlan(null);
      } catch {
        // Error handling is done in the hook
      }
    }
  };

  const confirmRename = async () => {
    if (selectedPlan && newPlanName.trim()) {
      try {
        await planActions.renamePlan(selectedPlan.id, newPlanName.trim());
        setRenameDialogOpen(false);
        setSelectedPlan(null);
        setNewPlanName("");
      } catch {
        // Error handling is done in the hook
      }
    }
  };

  const confirmDuplicate = async () => {
    if (selectedPlan) {
      try {
        await planActions.duplicatePlan(selectedPlan);
        setDuplicateDialogOpen(false);
        setSelectedPlan(null);
      } catch {
        // Error handling is done in the hook
      }
    }
  };

  const handleDownload = async (format: "pdf" | "csv" | "json") => {
    if (selectedPlan) {
      try {
        await planActions.downloadPlan(selectedPlan, format);
      } catch {
        // Error handling is done in the hook
      }
    }
  };

  const handleShare = async (isPublic: boolean) => {
    if (selectedPlan) {
      return await planActions.sharePlan(selectedPlan.id, isPublic);
    }
    return "";
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Unknown";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <BookmarkBorder
              sx={{ mr: 2, fontSize: 32, color: "primary.main" }}
            />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              Saved Plans
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Manage and access your academic plans
          </Typography>
        </Box>

        {/* Loading State */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading your plans...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Error Loading Plans
            </Typography>
            <Typography variant="body1">
              {error}. Please try refreshing the page.
            </Typography>
          </Alert>
        ) : plans.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No saved plans yet
            </Typography>
            <Typography variant="body1">
              Create your first academic plan to get started with your college
              journey planning.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => router.push("/generate")}
            >
              Generate Your First Plan
            </Button>
          </Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
              gap: 3,
              mb: 4,
            }}
          >
            {plans.map((plan) => (
              <Card
                key={plan.id}
                sx={{
                  height: "fit-content",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => {
                  handleViewPlan(plan);
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 600, flex: 1 }}
                    >
                      {plan.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Provide immediate visual feedback
                        setSnackbar({
                          open: true,
                          message: `Options for ${plan.name}`,
                          severity: "success",
                        });
                        handleMenuOpen(e, plan);
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                          transform: "scale(1.1)",
                        },
                        transition: "transform 0.1s ease-in-out",
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    {(plan.majors || []).map((major) => (
                      <Chip
                        key={major.id}
                        label={major.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {(plan.minors || []).map((minor) => (
                      <Chip
                        key={minor.id}
                        label={`Minor: ${minor.name}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {plan.startSemester?.season || "Fall"}{" "}
                      {plan.startSemester?.year || new Date().getFullYear()} -{" "}
                      {plan.endSemester?.season || "Spring"}{" "}
                      {plan.endSemester?.year || new Date().getFullYear() + 4}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Credits:{" "}
                      {(plan.semesters || []).reduce(
                        (sum, sem) => sum + (sem.totalCredits || 0),
                        0
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Semesters: {(plan.semesters || []).length}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(plan.createdAt)}
                    {plan.updatedAt &&
                      plan.createdAt &&
                      new Date(plan.updatedAt).getTime() !==
                        new Date(plan.createdAt).getTime() && (
                        <> • Updated: {formatDate(plan.updatedAt)}</>
                      )}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={
                      actionLoading[`view-${plan.id}`] ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Visibility />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPlan(plan);
                    }}
                    disabled={actionLoading[`view-${plan.id}`]}
                  >
                    {actionLoading[`view-${plan.id}`]
                      ? "Opening..."
                      : "View Plan"}
                  </Button>
                  <Button
                    size="small"
                    startIcon={
                      actionLoading[`edit-${plan.id}`] ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Edit />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      const actionKey = `edit-${plan.id}`;
                      setActionLoadingState(actionKey, true);

                      setSnackbar({
                        open: true,
                        message: `Preparing to edit ${plan.name}...`,
                        severity: "success",
                      });

                      // Execute action immediately
                      planActions.editPlan(plan);
                      setActionLoadingState(actionKey, false);
                    }}
                    disabled={actionLoading[`edit-${plan.id}`]}
                  >
                    {actionLoading[`edit-${plan.id}`] ? "Loading..." : "Edit"}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              if (selectedPlan) {
                handleViewPlan(selectedPlan);
                handleMenuClose();
              }
            }}
            disabled={
              planActions.loading ||
              Boolean(selectedPlan && actionLoading[`view-${selectedPlan.id}`])
            }
          >
            <Visibility sx={{ mr: 1 }} />
            View Plan
            {selectedPlan && actionLoading[`view-${selectedPlan.id}`] && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </MenuItem>
          <MenuItem
            onClick={handleEditPlan}
            disabled={
              planActions.loading ||
              Boolean(selectedPlan && actionLoading[`edit-${selectedPlan.id}`])
            }
          >
            <Edit sx={{ mr: 1 }} />
            Edit Plan
            {selectedPlan && actionLoading[`edit-${selectedPlan.id}`] && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </MenuItem>
          <MenuItem onClick={handleRenamePlan} disabled={planActions.loading}>
            <DriveFileRenameOutline sx={{ mr: 1 }} />
            Rename
            {planActions.loading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </MenuItem>
          <MenuItem
            onClick={handleDuplicatePlan}
            disabled={planActions.loading}
          >
            <ContentCopy sx={{ mr: 1 }} />
            Duplicate
            {planActions.loading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </MenuItem>
          <MenuItem onClick={handleSharePlan} disabled={planActions.loading}>
            <Share sx={{ mr: 1 }} />
            Share
            {planActions.loading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </MenuItem>
          <MenuItem onClick={handleDownloadPlan} disabled={planActions.loading}>
            <Download sx={{ mr: 1 }} />
            Download
            {planActions.loading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </MenuItem>
          <MenuItem
            onClick={handleDeletePlan}
            sx={{ color: "error.main" }}
            disabled={planActions.loading}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
            {planActions.loading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedPlan(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Plan"
          message={`Are you sure you want to delete "${selectedPlan?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          severity="error"
          loading={planActions.loading}
        />

        {/* Duplicate Confirmation Dialog */}
        <ConfirmationDialog
          open={duplicateDialogOpen}
          onClose={() => {
            setDuplicateDialogOpen(false);
            setSelectedPlan(null);
          }}
          onConfirm={confirmDuplicate}
          title="Duplicate Plan"
          message={`Create a copy of "${selectedPlan?.name}"?`}
          confirmText="Duplicate"
          severity="info"
          loading={planActions.loading}
        />

        {/* Rename Dialog */}
        <Dialog
          open={renameDialogOpen}
          onClose={() => {
            setRenameDialogOpen(false);
            setSelectedPlan(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Rename Plan</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="Plan Name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              sx={{ mt: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newPlanName.trim()) {
                  confirmRename();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setRenameDialogOpen(false);
              setSelectedPlan(null);
            }}>Cancel</Button>
            <Button
              onClick={confirmRename}
              variant="contained"
              disabled={!newPlanName.trim() || planActions.loading}
            >
              {planActions.loading ? "Renaming..." : "Rename"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Download Dialog */}
        {selectedPlan && (
          <DownloadDialog
            open={downloadDialogOpen}
            onClose={() => {
              setDownloadDialogOpen(false);
              setSelectedPlan(null);
            }}
            onDownload={handleDownload}
            planName={selectedPlan.name}
            loading={planActions.loading}
          />
        )}

        {/* Share Dialog */}
        {selectedPlan && (
          <ShareDialog
            open={shareDialogOpen}
            onClose={() => {
              setShareDialogOpen(false);
              setSelectedPlan(null);
            }}
            onShare={handleShare}
            planName={selectedPlan.name}
            loading={planActions.loading}
          />
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add new plan"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
          onClick={() => router.push("/generate")}
        >
          <Add />
        </Fab>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Box>
    </Container>
  );
}

export default function SavedPlansPage() {
  return (
    <ProtectedRoute>
      <SavedPlansContent />
    </ProtectedRoute>
  );
}
