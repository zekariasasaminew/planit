"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Search, School } from "@mui/icons-material";
import { Major, Minor } from "@/types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`programs-tabpanel-${index}`}
      aria-labelledby={`programs-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MajorsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [majors, setMajors] = useState<Major[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
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
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredMajors = majors.filter(
    (major) =>
      major.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      major.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMinors = minors.filter(
    (minor) =>
      minor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      minor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderProgramCard = (
    program: Major | Minor,
    type: "major" | "minor"
  ) => (
    <Card key={program.id} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <School
            sx={{
              mr: 1,
              color: type === "major" ? "primary.main" : "secondary.main",
            }}
          />
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {program.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {program.department}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={`${program.credits} credits`}
            size="small"
            color={type === "major" ? "primary" : "secondary"}
            variant="outlined"
          />
          <Chip
            label={type === "major" ? "Major" : "Minor"}
            size="small"
            color={type === "major" ? "primary" : "secondary"}
          />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading programs...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Error Loading Programs
            </Typography>
            <Typography variant="body1">
              {error}. Please try refreshing the page.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <School sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              {"Majors & Requirements"}
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Explore available academic programs and their requirements
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Full Requirements Coming Soon
          </Typography>
          <Typography variant="body1">
            {
              "Detailed course requirements, prerequisites, and graduation checklists will be available in a future update. For now, you can browse available programs below."
            }
          </Typography>
        </Alert>

        <TextField
          fullWidth
          placeholder="Search majors and minors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Majors (${filteredMajors.length})`} />
            <Tab label={`Minors (${filteredMinors.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 3,
            }}
          >
            {filteredMajors.map((major) => renderProgramCard(major, "major"))}
          </Box>
          {filteredMajors.length === 0 && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No majors found matching your search.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 3,
            }}
          >
            {filteredMinors.map((minor) => renderProgramCard(minor, "minor"))}
          </Box>
          {filteredMinors.length === 0 && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No minors found matching your search.
            </Typography>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
}
