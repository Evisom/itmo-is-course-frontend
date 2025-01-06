"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Button,
  TextField,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";
import { useErrorAlert } from "@/app/utils/useErrorAlert";

const Copies = () => {
  const { token } = useAuth();
  const { error, showError } = useErrorAlert();

  // Fetch copies data
  const { data: copiesData, mutate: mutateCopies } = useSWR(
    [`${config.API_URL}/library/copies`, token],
    ([url, token]) => fetcher(url, token)
  );

  // Shared state for form
  const [formState, setFormState] = useState({
    id: null,
    bookId: "",
    libraryId: "",
    inventoryNumber: "",
    available: false,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle form changes
  const handleInputChange = (field) => (event) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]:
        field === "available" ? event.target.checked : event.target.value,
    }));
  };

  // Open modal for editing
  const handleEdit = (row) => {
    setFormState({
      id: row.id,
      bookId: row.bookId,
      libraryId: row.libraryId,
      inventoryNumber: row.inventoryNumber,
      available: row.available,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState({
      id: null,
      bookId: "",
      libraryId: "",
      inventoryNumber: "",
      available: false,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const url =
        formState.id === null
          ? `${config.API_URL}/library/copies`
          : `${config.API_URL}/library/copies/${formState.id}`;
      const method = formState.id === null ? "POST" : "PUT";

      const payload = {
        bookId: parseInt(formState.bookId, 10),
        libraryId: parseInt(formState.libraryId, 10),
        inventoryNumber: formState.inventoryNumber,
        available: formState.available,
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Ошибка при сохранении экземпляра");
      }

      mutateCopies();
      handleCloseModal();
    } catch (err) {
      showError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${config.API_URL}/library/copies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при удалении экземпляра");
      }

      mutateCopies();
    } catch (err) {
      showError(err.message);
    }
  };

  // Define columns
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "bookId", headerName: "ID Книги", flex: 2 },
    { field: "libraryId", headerName: "ID Библиотеки", flex: 2 },
    { field: "inventoryNumber", headerName: "Инвентарный номер", flex: 3 },
    {
      field: "available",
      headerName: "Доступен",
      flex: 2,
      renderCell: (params) => (params.row.available ? "Да" : "Нет"),
    },
    {
      field: "actions",
      headerName: "Действия",
      flex: 5,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{ display: "flex", gap: 1, height: "100%", alignItems: "center" }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Удалить
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <div className="alert">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </div>

      <Button
        variant="contained"
        onClick={() => setIsModalOpen(true)}
        sx={{ mb: 2 }}
      >
        Добавить экземпляр
      </Button>
      <DataGrid
        rows={copiesData || []}
        columns={columns}
        autoHeight
        hideFooter
        hideFooterPagination
      />
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>
          {formState.id === null
            ? "Добавление экземпляра"
            : "Редактирование экземпляра"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="ID Книги"
            value={formState.bookId}
            onChange={handleInputChange("bookId")}
            fullWidth
            margin="normal"
          />
          <TextField
            label="ID Библиотеки"
            value={formState.libraryId}
            onChange={handleInputChange("libraryId")}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Инвентарный номер"
            value={formState.inventoryNumber}
            onChange={handleInputChange("inventoryNumber")}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formState.available}
                onChange={handleInputChange("available")}
              />
            }
            label="Доступен"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Отмена
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Copies;
