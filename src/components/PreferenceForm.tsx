"use client";

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Slider,
  Paper,
  Divider,
} from "@mui/material";
import { Settings, CreditCard, Schedule, WbSunny } from "@mui/icons-material";
import { PlanPreferences } from "@/types";

interface PreferenceFormProps {
  preferences: PlanPreferences;
  onChange: (preferences: PlanPreferences) => void;
}

export const PreferenceForm: React.FC<PreferenceFormProps> = ({
  preferences,
  onChange,
}) => {
  const handleChange = (field: keyof PlanPreferences, value: any) => {
    onChange({
      ...preferences,
      [field]: value,
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Settings sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Plan Preferences
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Max Credits per Semester */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CreditCard sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Maximum Credits per Semester
            </Typography>
          </Box>
          <Box sx={{ px: 2 }}>
            <Slider
              value={preferences.maxCreditsPerSemester}
              onChange={(_, value) =>
                handleChange("maxCreditsPerSemester", value)
              }
              min={12}
              max={21}
              step={1}
              marks={[
                { value: 12, label: "12" },
                { value: 15, label: "15" },
                { value: 18, label: "18" },
                { value: 21, label: "21" },
              ]}
              valueLabelDisplay="on"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Divider />

        {/* Elective Priority */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Schedule sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Elective Course Timing
            </Typography>
          </Box>
          <FormControl>
            <RadioGroup
              value={preferences.electivePriority}
              onChange={(e) => handleChange("electivePriority", e.target.value)}
              row
            >
              <FormControlLabel
                value="early"
                control={<Radio size="small" />}
                label="Take early"
              />
              <FormControlLabel
                value="distributed"
                control={<Radio size="small" />}
                label="Distribute evenly"
              />
              <FormControlLabel
                value="late"
                control={<Radio size="small" />}
                label="Take later"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider />

        {/* Course Options */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <WbSunny sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Course Options
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body1">Summer Courses</Typography>
                <Typography variant="body2" color="text.secondary">
                  Include summer semester courses
                </Typography>
              </Box>
              <Switch
                checked={preferences.summerCourses}
                onChange={(e) =>
                  handleChange("summerCourses", e.target.checked)
                }
                color="primary"
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body1">Winterim Courses</Typography>
                <Typography variant="body2" color="text.secondary">
                  Include winter intersession courses
                </Typography>
              </Box>
              <Switch
                checked={preferences.winterimCourses}
                onChange={(e) =>
                  handleChange("winterimCourses", e.target.checked)
                }
                color="primary"
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body1">Online Courses</Typography>
                <Typography variant="body2" color="text.secondary">
                  Allow online and hybrid courses
                </Typography>
              </Box>
              <Switch
                checked={preferences.onlineCoursesAllowed}
                onChange={(e) =>
                  handleChange("onlineCoursesAllowed", e.target.checked)
                }
                color="primary"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
