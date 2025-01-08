import React from "react";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const BookCover = ({
  title,
  authors,
  id,
}: {
  title: string;
  authors: string[];
  id: number;
}) => {
  const theme = useTheme();

  // Generate a color based on the book's ID
  const colorKeys = [
    "primary",
    "secondary",
    "error",
    "warning",
    "info",
    "success",
  ];
  const backgroundColor = theme.palette[colorKeys[id % colorKeys.length]].main;

  return (
    <Box
      sx={{
        width: "100%",
        height: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        color: theme.palette.getContrastText(backgroundColor),
        borderRadius: 2,
        padding: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
        {title}
      </Typography>
      <Typography variant="body2">
        {authors.length > 0 ? authors.join(", ") : "Неизвестный автор"}
      </Typography>
    </Box>
  );
};

export default BookCover;
