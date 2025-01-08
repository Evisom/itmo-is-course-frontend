"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Snackbar,
  Alert,
  TextField,
  Box,
} from "@mui/material";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";

const LibraryManagementPage = () => {
  const { token } = useAuth();
  const { data: librariesData, error: librariesError } = useSWR(
    [`${config.API_URL}/library/allLibraries`, token],
    ([url, token]) => fetcher(url, token)
  );

  const [newLibrary, setNewLibrary] = useState({
    name: "",
    address: "",
    openingTime: "",
    closingTime: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // Can be 'success' or 'error'
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (field, value) => {
    setNewLibrary((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLibrary = async () => {
    const { name, address, openingTime, closingTime } = newLibrary;

    if (!name || !address || !openingTime || !closingTime) {
      setSnackbar({
        open: true,
        message: "Заполните все поля",
        severity: "error",
      });
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/library/new`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLibrary),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Библиотека успешно добавлена",
          severity: "success",
        });
        setNewLibrary({
          name: "",
          address: "",
          openingTime: "",
          closingTime: "",
        });
        mutate([`${config.API_URL}/library/allLibraries`, token]);
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || "Ошибка при добавлении библиотеки",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Ошибка при добавлении библиотеки:", error);
      setSnackbar({
        open: true,
        message: "Сетевая ошибка. Попробуйте позже",
        severity: "error",
      });
    }
  };

  if (!librariesData) {
    return <Typography>Загрузка библиотек...</Typography>;
  }

  if (librariesError) {
    return <Typography color="error">Ошибка загрузки библиотек</Typography>;
  }

  return (
    <Box>
      {/* Add New Library Form */}
      <Card sx={{ marginTop: "24px", marginBottom: "24px" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Добавить новую библиотеку
          </Typography>
          <TextField
            label="Название"
            value={newLibrary.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Адрес"
            value={newLibrary.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Время открытия (HH:MM)"
            value={newLibrary.openingTime}
            onChange={(e) => handleInputChange("openingTime", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Время закрытия (HH:MM)"
            value={newLibrary.closingTime}
            onChange={(e) => handleInputChange("closingTime", e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddLibrary}
            fullWidth
            sx={{ marginTop: "10px" }}
          >
            Добавить
          </Button>
        </CardContent>
      </Card>

      <TableContainer component={Card} style={{ marginBottom: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Время открытия</TableCell>
              <TableCell>Время закрытия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {librariesData.map((library) => (
              <TableRow key={library.id}>
                <TableCell>{library.name}</TableCell>
                <TableCell>{library.address}</TableCell>
                <TableCell>{library.openingTime}</TableCell>
                <TableCell>{library.closingTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default LibraryManagementPage;
