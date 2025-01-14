"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Box,
  Input,
} from "@mui/material";
import { useAuth } from "@/app/components/AuthProvider";
import { config } from "@/app/utils/config";

const CsvImportPage = () => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: "Выберите файл для импорта",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${config.API_URL}/library/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Файл успешно импортирован",
          severity: "success",
        });
        setFile(null); // Сбросить выбранный файл после успешной загрузки
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || "Ошибка при импорте файла",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки файла:", error);
      setSnackbar({
        open: true,
        message: "Сетевая ошибка. Попробуйте позже",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Импорт CSV файлов
          </Typography>
          <Box sx={{ my: 2 }}>
            <Input
              type="file"
              inputProps={{ accept: ".csv" }}
              onChange={handleFileChange}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!file}
          >
            Отправить
          </Button>
        </CardContent>
      </Card>

      {/* Snackbar для уведомлений */}
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

export default CsvImportPage;
