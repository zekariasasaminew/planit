"use client";

import React, { useState, useEffect } from "react";
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
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Fade,
  LinearProgress,
} from "@mui/material";
import { AutoAwesome, NavigateNext, NavigateBefore } from "@mui/icons-material";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MajorSelector } from "@/components/MajorSelector";
import { MinorSelector } from "@/components/MinorSelector";
import { PreferenceForm } from "@/components/PreferenceForm";

import {
  GeneratePlanRequest,
  GeneratePlanApiRequest,
  SemesterSeason,
  Major,
  Minor,
} from "@/types";

const steps = [
  "Basic Information",
  "Academic Selection",
  "Preferences",
  "Review & Generate",
];

const currentYear = new Date().getFullYear();
const seasons = ["Fall", "Spring", "Summer"];
const years = Array.from({ length: 8 }, (_, i) => currentYear + i);

function GeneratePlanContent() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [majors, setMajors] = useState<Major[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

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
    preferences: {
      maxCreditsPerSemester: 16,
      electivePriority: "distributed",
      summerCourses: false,
      winterimCourses: false,
      onlineCoursesAllowed: true,
    },
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setDataLoading(true);
        const [majorsResponse, minorsResponse] = await Promise.all([
          fetch("/api/catalog/majors"),
          fetch("/api/catalog/minors"),
        ]);

        if (!majorsResponse.ok || !minorsResponse.ok) {
          throw new Error("Failed to fetch programs");
        }

        const majorsData = await majorsResponse.json();
        const minorsData = await minorsResponse.json();

        setMajors(majorsData);
        setMinors(minorsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load programs"
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchPrograms();
  }, []);

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
    setLoadingProgress(0);

    try {
      const phases = [
        "Analyzing degree requirements...",
        "Checking course prerequisites...",
        "Optimizing semester distribution...",
        "Generating personalized timeline...",
        "Finalizing your academic plan...",
      ];

      for (let i = 0; i < phases.length - 1; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setLoadingProgress((i + 1) * 18);
      }

      const startYear = formData.startSemester.year;
      const endYear = formData.endSemester.year;
      const startSeason = formData.startSemester.season;
      const endSeason = formData.endSemester.season;

      const yearDiff = endYear - startYear;
      const semestersFromYears = yearDiff * 2;

      let seasonAdjustment = 0;
      if (startSeason === "Spring") seasonAdjustment -= 1;
      if (startSeason === "Summer") seasonAdjustment -= 0.5;
      if (endSeason === "Fall") seasonAdjustment += 1;
      if (endSeason === "Summer") seasonAdjustment += 0.5;

      const semestersRemaining = Math.max(
        1,
        Math.round(semestersFromYears + seasonAdjustment)
      );

      const generateRequest: GeneratePlanApiRequest = {
        majorIds: formData.majors,
        minorIds: formData.minors,
        takenCourseIds: [], // No courses taken yet
        transferCredits: 0, // No transfer credits for now
        semestersRemaining,
        prefersSummer: formData.preferences.summerCourses,
        maxCreditsPerSemester: formData.preferences.maxCreditsPerSemester,
        allowOverload: false, // Conservative default
        targetGraduateEarly: false, // Conservative default
        startSeason: formData.startSemester.season,
        startYear: formData.startSemester.year,
      };

      const response = await fetch("/api/plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generateRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate plan");
      }

      const generationResult = await response.json();
      setLoadingProgress(100);

      const planName = `Academic Plan - ${new Date().toLocaleDateString()}`;
      const createPlanRequest = {
        name: planName,
        startSeason: formData.startSemester.season,
        startYear: formData.startSemester.year,
        preferences: {
          prefersSummer: formData.preferences.summerCourses,
          maxCreditsPerSemester: formData.preferences.maxCreditsPerSemester,
          allowOverload: false,
          targetGraduateEarly: false,
          transferCredits: 0,
        },
      };

      const createResponse = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPlanRequest),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to save generated plan");
      }

      const savedPlan = await createResponse.json();

      if (generationResult.plan && generationResult.plan.semesters) {
        for (let i = 0; i < generationResult.plan.semesters.length; i++) {
          const semester = generationResult.plan.semesters[i];

          const semesterResponse = await fetch(
            `/api/plans/${savedPlan.id}/semesters`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                season: semester.season,
                year: semester.year,
                position: i,
              }),
            }
          );

          if (semesterResponse.ok) {
            const savedSemester = await semesterResponse.json();

            if (semester.courses && semester.courses.length > 0) {
              for (const course of semester.courses) {
                const courseResponse = await fetch(
                  `/api/plans/${savedPlan.id}/semesters/${savedSemester.id}/courses`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      courseId: course.id,
                    }),
                  }
                );

                if (courseResponse.ok) {
                }
              }
            }
          }
        }
      }

      router.push(`/planner?id=${savedPlan.id}&generated=true`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate plan. Please try again."
      );
    } finally {
      setIsGenerating(false);
      setLoadingProgress(0);
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
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Start Semester
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
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
                          season: e.target.value as SemesterSeason,
                        },
                      }))
                    }
                    aria-label="Select start semester season"
                  >
                    {seasons.map((season) => (
                      <MenuItem key={season} value={season}>
                        {season}
                      </MenuItem>
                    ))}
                  </TextField>
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
                    aria-label="Select start semester year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  End Semester (Expected Graduation)
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
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
                          season: e.target.value as SemesterSeason,
                        },
                      }))
                    }
                    aria-label="Select end semester season"
                  >
                    {seasons.map((season) => (
                      <MenuItem key={season} value={season}>
                        {season}
                      </MenuItem>
                    ))}
                  </TextField>
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
                    aria-label="Select end semester year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Select your academic programs
            </Typography>
            <MajorSelector
              majors={majors}
              selectedMajors={majors.filter((m) =>
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
              minors={minors}
              selectedMinors={minors.filter((m) =>
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
                    .map((id) => majors.find((m) => m.id === id)?.name)
                    .join(", ") || "None selected"}
                </Typography>
                <Typography variant="body1">
                  <strong>Minors:</strong>{" "}
                  {formData.minors
                    .map((id) => minors.find((m) => m.id === id)?.name)
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

              {/* Loading Progress */}
              {isGenerating && (
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CircularProgress
                      size={24}
                      sx={{ color: "primary.contrastText", mr: 2 }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Generating Your Academic Plan...
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={loadingProgress}
                    sx={{
                      mb: 1,
                      bgcolor: "rgba(255,255,255,0.3)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "primary.contrastText",
                      },
                    }}
                  />
                  <Typography variant="body2">
                    {loadingProgress}% Complete
                  </Typography>
                </Paper>
              )}
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
              {"Let's create a personalized plan for your academic journey"}
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

          {dataLoading ? (
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
                Loading programs...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || isGenerating}
              startIcon={<NavigateBefore />}
              aria-label="Go back to previous step"
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
                aria-label="Generate academic plan"
              >
                {isGenerating ? "Generating..." : "Generate Plan"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isGenerating}
                endIcon={<NavigateNext />}
                aria-label="Go to next step"
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

export default function GeneratePlanPage() {
  return (
    <ProtectedRoute>
      <GeneratePlanContent />
    </ProtectedRoute>
  );
}
