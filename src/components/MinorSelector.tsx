"use client";

import React from "react";
import { Autocomplete, TextField, Chip, Box, Typography } from "@mui/material";
import { School } from "@mui/icons-material";
import { Minor } from "@/types";

interface MinorSelectorProps {
  minors: Minor[];
  selectedMinors: Minor[];
  onChange: (minors: Minor[]) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

export const MinorSelector: React.FC<MinorSelectorProps> = ({
  minors,
  selectedMinors,
  onChange,
  label = "Minor(s)",
  placeholder = "Select your minor(s) (optional)",
  error = false,
  helperText,
}) => {
  return (
    <Autocomplete
      multiple
      options={minors}
      value={selectedMinors}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={selectedMinors.length === 0 ? placeholder : ""}
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
            color="secondary"
            variant="outlined"
            size="small"
          />
        ))
      }
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box component="li" key={key} {...otherProps}>
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <Typography variant="body1">{option.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.department} • {option.credits} credits
              </Typography>
            </Box>
          </Box>
        );
      }}
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
