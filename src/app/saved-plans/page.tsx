"use client";

import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
} from "@mui/icons-material";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { mockSavedPlans } from "@/data/mockData";
import { AcademicPlan } from "@/types";

function SavedPlansContent() {
  const router = useRouter();
  const [plans] = useState<AcademicPlan[]>(mockSavedPlans);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlan, setSelectedPlan] = useState<AcademicPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    plan: AcademicPlan
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlan(null);
  };

  const handleViewPlan = (plan: AcademicPlan) => {
    router.push(`/planner?id=${plan.id}`);
  };

  const handleEditPlan = () => {
    if (selectedPlan) {
      router.push(`/generate?edit=${selectedPlan.id}`);
    }
    handleMenuClose();
  };

  const handleDeletePlan = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleRenamePlan = () => {
    if (selectedPlan) {
      setNewPlanName(selectedPlan.name);
      setRenameDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmDelete = () => {
    // Handle delete logic here
    setDeleteDialogOpen(false);
    setSelectedPlan(null);
  };

  const confirmRename = () => {
    // Handle rename logic here
    setRenameDialogOpen(false);
    setSelectedPlan(null);
    setNewPlanName("");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
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

        {/* Plans Grid */}
        {plans.length === 0 ? (
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
                        handleMenuOpen(e, plan);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    {plan.majors.map((major) => (
                      <Chip
                        key={major.id}
                        label={major.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {plan.minors.map((minor) => (
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
                      Duration: {plan.startSemester.season}{" "}
                      {plan.startSemester.year} - {plan.endSemester.season}{" "}
                      {plan.endSemester.year}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Credits:{" "}
                      {plan.semesters.reduce(
                        (sum, sem) => sum + sem.totalCredits,
                        0
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Semesters: {plan.semesters.length}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(plan.createdAt)}
                    {plan.updatedAt.getTime() !== plan.createdAt.getTime() && (
                      <> • Updated: {formatDate(plan.updatedAt)}</>
                    )}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewPlan(plan)}
                  >
                    View Plan
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/generate?edit=${plan.id}`);
                    }}
                  >
                    Edit
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
            onClick={() => selectedPlan && handleViewPlan(selectedPlan)}
          >
            <Visibility sx={{ mr: 1 }} />
            View Plan
          </MenuItem>
          <MenuItem onClick={handleEditPlan}>
            <Edit sx={{ mr: 1 }} />
            Edit Plan
          </MenuItem>
          <MenuItem onClick={handleRenamePlan}>
            <Edit sx={{ mr: 1 }} />
            Rename
          </MenuItem>
          <MenuItem onClick={() => alert("Share functionality coming soon!")}>
            <Share sx={{ mr: 1 }} />
            Share
          </MenuItem>
          <MenuItem
            onClick={() => alert("Download functionality coming soon!")}
          >
            <Download sx={{ mr: 1 }} />
            Download
          </MenuItem>
          <MenuItem onClick={handleDeletePlan} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Plan</DialogTitle>
          <DialogContent>
            <Typography>
              {'Are you sure you want to delete "'}
              {selectedPlan?.name}
              {'"? This action cannot be undone.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog
          open={renameDialogOpen}
          onClose={() => setRenameDialogOpen(false)}
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmRename} variant="contained">
              Rename
            </Button>
          </DialogActions>
        </Dialog>

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
