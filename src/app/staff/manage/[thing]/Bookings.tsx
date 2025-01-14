"use client";

import React, { useState } from "react";
import useSWR from "swr";
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
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";
import { Progress } from "@/app/components/Progress";

const ApprovalsPage = () => {
  const { token } = useAuth();
  const [selectedLibrary, setSelectedLibrary] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [decliningRequestId, setDecliningRequestId] = useState<number | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // Can be 'success' or 'error'
  });

  const { data: librariesData, error: librariesError } = useSWR(
    [token ? `${config.API_URL}/library/allLibraries` : null, token],
    ([url, token]) => fetcher(url, token)
  );

  const {
    data: operationsData,
    error: operationsError,
    mutate,
  } = useSWR(
    selectedLibrary
      ? [`${config.API_URL}/operations?libraryId=${selectedLibrary}`, token]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleApprove = async (requestId: number) => {
    try {
      await fetch(`${config.API_URL}/operations/approve/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({
        open: true,
        message: "Заявка успешно одобрена",
        severity: "success",
      });
      mutate(); // Refresh the list of requests
    } catch (error) {
      console.error("Ошибка при одобрении заявки:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при одобрении заявки",
        severity: "error",
      });
    }
  };

  const handleDecline = async () => {
    if (!decliningRequestId || !declineReason.trim()) return;

    try {
      await fetch(
        `${config.API_URL}/operations/decline/${decliningRequestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: declineReason }),
        }
      );
      setSnackbar({
        open: true,
        message: "Заявка успешно отклонена",
        severity: "success",
      });
      setDeclineDialogOpen(false);
      mutate(); // Refresh the list of requests
    } catch (error) {
      console.error("Ошибка при отклонении заявки:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при отклонении заявки",
        severity: "error",
      });
    }
  };

  if (!librariesData) return <Progress />;
  if (librariesError)
    return <Typography color="error">Ошибка загрузки библиотек</Typography>;

  return (
    <div>
      {/* Library Selection */}
      <Card style={{ marginBottom: "20px" }}>
        <CardContent>
          <Typography variant="h6">Выберите библиотеку</Typography>
          <Select
            value={selectedLibrary || ""}
            onChange={(e) => setSelectedLibrary(Number(e.target.value))}
            fullWidth
          >
            <MenuItem value="" disabled>
              Выберите филиал
            </MenuItem>
            {librariesData.map((library) => (
              <MenuItem key={library.id} value={library.id}>
                {library.name}
              </MenuItem>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Reservation Requests */}
      {selectedLibrary && operationsData ? (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя и Фамилия</TableCell>
                <TableCell>Почта</TableCell>
                <TableCell>Книга</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Inventory ID</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operationsData.length > 0 ? (
                operationsData.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.firstName} {request.lastName}
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      {request.author
                        .map((author) => `${author.name} ${author.surname}`)
                        .join(", ")}
                    </TableCell>
                    <TableCell>{request.inventoryId}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleApprove(request.id)}
                      >
                        Одобрить
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        style={{ marginLeft: "10px" }}
                        onClick={() => {
                          setDecliningRequestId(request.id);
                          setDeclineDialogOpen(true);
                        }}
                      >
                        Отклонить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Нет заявок
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        selectedLibrary && <Progress />
      )}

      {/* Decline Reason Dialog */}
      <Dialog
        open={declineDialogOpen}
        onClose={() => setDeclineDialogOpen(false)}
      >
        <DialogTitle>Причина отказа</DialogTitle>
        <DialogContent>
          <TextField
            label="Причина"
            multiline
            rows={4}
            fullWidth
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDecline} color="error">
            Отклонить
          </Button>
        </DialogActions>
      </Dialog>

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
    </div>
  );
};

export default ApprovalsPage;
