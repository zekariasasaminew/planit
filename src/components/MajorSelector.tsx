"use client";

import React from "react";
import { Autocomplete, TextField, Chip, Box, Typography } from "@mui/material";
import { School } from "@mui/icons-material";
import { Major } from "@/types";

interface MajorSelectorProps {
  majors: Major[];
  selectedMajors: Major[];
  onChange: (majors: Major[]) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

export const MajorSelector: React.FC<MajorSelectorProps> = ({
  majors,
  selectedMajors,
  onChange,
  label = "Major(s)",
  placeholder = "Select your major(s)",
  error = false,
  helperText,
}) => {
  return (
    <Autocomplete
      multiple
      options={majors}
      value={selectedMajors}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={selectedMajors.length === 0 ? placeholder : ""}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                <School color="action" />
                {params.InputProps.startAdornment}
              </Box>
            ),
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.name}
            {...getTagProps({ index })}
            key={option.id}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography variant="body1">{option.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {option.department} • {option.credits} credits
            </Typography>
          </Box>
        </Box>
      )}
      filterSelectedOptions
      clearOnEscape
      sx={{
        "& .MuiAutocomplete-tag": {
          margin: "2px",
        },
      }}
    />
  );
};
