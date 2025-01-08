"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";

const Return = () => {
  const { token } = useAuth();
  const [invNumber, setInvNumber] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // Can be 'success' or 'error'
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleReturn = async () => {
    if (!invNumber.trim()) {
      setSnackbar({
        open: true,
        message: "Пожалуйста, введите инвентарный номер",
        severity: "error",
      });
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/operations/return`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invNumber }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Книга успешно возвращена",
          severity: "success",
        });
        setInvNumber(""); // Clear the input field after successful return
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || "Ошибка при возврате книги",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Ошибка при возврате книги:", error);
      setSnackbar({
        open: true,
        message: "Ошибка. Этот номер не забронирован",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Вернуть книгу
          </Typography>
          <TextField
            label="Инвентарный номер"
            value={invNumber}
            onChange={(e) => setInvNumber(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleReturn}
            fullWidth
            sx={{ marginTop: "10px" }}
          >
            Вернуть
          </Button>
        </CardContent>
      </Card>

      {/* Snackbar for Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Return;
