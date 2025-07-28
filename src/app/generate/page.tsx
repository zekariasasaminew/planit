"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Fade,
} from "@mui/material";
import { AutoAwesome, NavigateNext, NavigateBefore } from "@mui/icons-material";
import { MajorSelector } from "@/components/MajorSelector";
import { MinorSelector } from "@/components/MinorSelector";
import { PreferenceForm } from "@/components/PreferenceForm";
import { mockMajors, mockMinors, defaultPreferences } from "@/data/mockData";
import { Major, Minor, PlanPreferences, GeneratePlanRequest } from "@/types";

const steps = [
  "Basic Information",
  "Academic Selection",
  "Preferences",
  "Review & Generate",
];

const currentYear = new Date().getFullYear();
const seasons = ["Fall", "Spring", "Summer"];
const years = Array.from({ length: 8 }, (_, i) => currentYear + i);

export default function GeneratePlanPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<GeneratePlanRequest>({
    majors: [],
    minors: [],
    startSemester: {
      season: "Fall",
      year: currentYear,
    },
    endSemester: {
      season: "Spring",
      year: currentYear + 4,
    },
    preferences: defaultPreferences,
  });

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setError(null);
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return true; // Basic info is optional for now
      case 1:
        if (formData.majors.length === 0) {
          setError("Please select at least one major");
          return false;
        }
        return true;
      case 2:
        return true; // Preferences are optional
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful generation
      console.log("Generating plan with data:", formData);

      // Navigate to planner view with the generated plan
      router.push("/planner?generated=true");
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              When do you plan to start and finish?
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Start Semester
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select
                      fullWidth
                      label="Season"
                      value={formData.startSemester.season}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startSemester: {
                            ...prev.startSemester,
                            season: e.target.value as any,
                          },
                        }))
                      }
                    >
                      {seasons.map((season) => (
                        <MenuItem key={season} value={season}>
                          {season}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      fullWidth
                      label="Year"
                      value={formData.startSemester.year}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startSemester: {
                            ...prev.startSemester,
                            year: parseInt(e.target.value),
                          },
                        }))
                      }
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  End Semester (Expected Graduation)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select
                      fullWidth
                      label="Season"
                      value={formData.endSemester.season}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endSemester: {
                            ...prev.endSemester,
                            season: e.target.value as any,
                          },
                        }))
                      }
                    >
                      {seasons.map((season) => (
                        <MenuItem key={season} value={season}>
                          {season}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      fullWidth
                      label="Year"
                      value={formData.endSemester.year}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endSemester: {
                            ...prev.endSemester,
                            year: parseInt(e.target.value),
                          },
                        }))
                      }
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Select your academic programs
            </Typography>
            <MajorSelector
              majors={mockMajors}
              selectedMajors={mockMajors.filter((m) =>
                formData.majors.includes(m.id)
              )}
              onChange={(majors) =>
                setFormData((prev) => ({
                  ...prev,
                  majors: majors.map((m) => m.id),
                }))
              }
              error={!!error && formData.majors.length === 0}
              helperText={
                formData.majors.length === 0
                  ? "At least one major is required"
                  : ""
              }
            />
            <MinorSelector
              minors={mockMinors}
              selectedMinors={mockMinors.filter((m) =>
                formData.minors.includes(m.id)
              )}
              onChange={(minors) =>
                setFormData((prev) => ({
                  ...prev,
                  minors: minors.map((m) => m.id),
                }))
              }
              label="Minor(s)"
              placeholder="Select your minor(s) (optional)"
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Customize your plan preferences
            </Typography>
            <PreferenceForm
              preferences={formData.preferences}
              onChange={(preferences) =>
                setFormData((prev) => ({ ...prev, preferences }))
              }
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Review your plan details
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Timeline
                </Typography>
                <Typography variant="body1">
                  <strong>Start:</strong> {formData.startSemester.season}{" "}
                  {formData.startSemester.year}
                </Typography>
                <Typography variant="body1">
                  <strong>End:</strong> {formData.endSemester.season}{" "}
                  {formData.endSemester.year}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Academic Programs
                </Typography>
                <Typography variant="body1">
                  <strong>Majors:</strong>{" "}
                  {formData.majors
                    .map((id) => mockMajors.find((m) => m.id === id)?.name)
                    .join(", ") || "None selected"}
                </Typography>
                <Typography variant="body1">
                  <strong>Minors:</strong>{" "}
                  {formData.minors
                    .map((id) => mockMinors.find((m) => m.id === id)?.name)
                    .join(", ") || "None selected"}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Preferences
                </Typography>
                <Typography variant="body1">
                  <strong>Max Credits per Semester:</strong>{" "}
                  {formData.preferences.maxCreditsPerSemester}
                </Typography>
                <Typography variant="body1">
                  <strong>Elective Priority:</strong>{" "}
                  {formData.preferences.electivePriority}
                </Typography>
                <Typography variant="body1">
                  <strong>Summer Courses:</strong>{" "}
                  {formData.preferences.summerCourses ? "Yes" : "No"}
                </Typography>
              </Paper>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Fade in timeout={600}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <AutoAwesome sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Generate Academic Plan
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Let's create a personalized plan for your academic journey
            </Typography>
          </Box>
        </Fade>

        <Paper sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<NavigateBefore />}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                startIcon={
                  isGenerating ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AutoAwesome />
                  )
                }
                sx={{ minWidth: 140 }}
              >
                {isGenerating ? "Generating..." : "Generate Plan"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NavigateNext />}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
