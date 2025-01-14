"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
} from "@mui/material";
import { config } from "@/app/utils/config";

import { useAuth } from "@/app/components/AuthProvider";
import { Progress } from "@/app/components/Progress";

const LibraryReportPage = () => {
  const searchParams = useSearchParams();
  const libraryId = searchParams.get("libraryId");
  const date = searchParams.get("date");
  const { token } = useAuth();

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${config.API_URL}/operations/libraryReport/${libraryId}?date=${date}`,
          {
            headers: {
              authorization: "Bearer " + token,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Ошибка загрузки отчета о библиотеке");
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(err.message);
        setSnackbar({ open: true, message: err.message, severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (libraryId && date) {
      fetchReport();
    }
  }, [libraryId, date]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!libraryId || !date) {
    return (
      <Typography color="error">
        Параметры libraryId и date обязательны
      </Typography>
    );
  }
  if (loading) {
    return <Progress />;
  }

  return (
    <Box sx={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Отчет о библиотеке
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Card} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название книги</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Жанр</TableCell>
                <TableCell>Тема</TableCell>
                <TableCell>Издатель</TableCell>
                <TableCell>Рейтинг</TableCell>
                <TableCell>Кол-во</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map(({ bookModels, count }) => (
                <TableRow key={bookModels.id}>
                  <TableCell>{bookModels.title}</TableCell>
                  <TableCell>
                    {bookModels.authors
                      .map((author) => `${author.name} ${author.surname}`)
                      .join(", ")}
                  </TableCell>
                  <TableCell>{bookModels.genre?.name || "Не указан"}</TableCell>
                  <TableCell>
                    {bookModels.theme?.name || "Не указана"}
                  </TableCell>
                  <TableCell>
                    {bookModels.publisher?.name || "Не указан"}
                  </TableCell>
                  <TableCell>{bookModels.rating || "-"}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
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

export default LibraryReportPage;
