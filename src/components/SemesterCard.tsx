"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  Badge,
} from "@mui/material";
import { School, Schedule } from "@mui/icons-material";
import { Semester, Course, ChipColor } from "@/types";

interface SemesterCardProps {
  semester: Semester;
}

const getCourseTypeColor = (type: Course["type"]): ChipColor => {
  switch (type) {
    case "Major":
      return "primary";
    case "Core":
      return "secondary";
    case "Gen Ed":
      return "success";
    case "LP":
      return "warning";
    case "Elective":
      return "info";
    case "Minor":
      return "error";
    default:
      return "default";
  }
};

export const SemesterCard: React.FC<SemesterCardProps> = ({ semester }) => {
  return (
    <Card
      sx={{
        minWidth: 300,
        height: "fit-content",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardHeader
        avatar={
          <Badge badgeContent={semester.totalCredits} color="primary">
            <School color="primary" />
          </Badge>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {semester.name}
          </Typography>
        }
        subheader={
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <Schedule sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {semester.totalCredits} credits • {semester.courses.length}{" "}
              courses
            </Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ pt: 0 }}>
        <List dense sx={{ py: 0 }}>
          {semester.courses.map((course) => (
            <ListItem
              key={course.id}
              sx={{
                px: 0,
                py: 0.5,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {course.code}
                  </Typography>
                  <Chip
                    label={course.type}
                    size="small"
                    color={getCourseTypeColor(course.type)}
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.75rem" }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ mb: 0.25 }}
                >
                  {course.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {course.credits} {course.credits === 1 ? "credit" : "credits"}
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <span>
                      {" "}
                      • Prerequisites: {course.prerequisites.join(", ")}
                    </span>
                  )}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>

        {semester.courses.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <School sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography variant="body2">No courses planned</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
