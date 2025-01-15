"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress,
  Autocomplete,
  TextField,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";
import { useErrorAlert } from "@/app/utils/useErrorAlert";

const Copies = () => {
  const { token } = useAuth();
  const { error, showError } = useErrorAlert();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [formState, setFormState] = useState({
    id: null,
    bookId: "",
    libraryId: "",
    inventoryNumber: "",
    available: false,
    bookTitle: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch libraries for the dropdown
  const { data: libraries } = useSWR(
    token ? [`${config.API_URL}/library/allLibraries`, token] : null,
    ([url, token]) => fetcher(url, token)
  );

  // Fetch copies data
  const { data, isLoading, mutate } = useSWR(
    token
      ? [
          `${config.API_URL}/library/copies?page=${paginationModel.page}&size=${paginationModel.pageSize}`,
          token,
        ]
      : null,
    ([url, token]) => fetcher(url, token),
    { revalidateOnFocus: false }
  );

  // Fetch books based on input
  const [bookOptions, setBookOptions] = useState([]);
  const handleBookSearch = async (query) => {
    const params = new URLSearchParams();
    params.append("name", query);
    if (query.length > 0) {
      const response = await fetch(
        `${config.API_URL}/library/find?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const books = await response.json();
        setBookOptions(
          books.content.map((book) => ({ id: book.id, label: book.title }))
        );
      }
    }
  };

  // Fetch book title for editing
  const fetchBookTitle = async (bookId) => {
    try {
      const response = await fetch(
        `${config.API_URL}/library/books/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const book = await response.json();

        return book.title;
      }
    } catch {
      return "Неизвестная книга";
    }
  };

  const handleInputChange = (field) => (event, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: field === "available" ? event.target.checked : value,
    }));
  };

  const handleEdit = async (row) => {
    const bookTitle = await fetchBookTitle(row.bookId);
    setBookOptions((prev) => [...prev, { id: row.bookId, label: bookTitle }]);
    setFormState({
      id: row.id,
      bookId: row.bookId,
      libraryId: row.libraryId,
      inventoryNumber: row.inventoryNumber,
      available: row.available,
      bookTitle,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState({
      id: null,
      bookId: "",
      libraryId: "",
      inventoryNumber: "",
      available: false,
      bookTitle: "",
    });
  };

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

      mutate();
      handleCloseModal();
    } catch (err) {
      showError(err.message);
    }
  };

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

      mutate();
    } catch (err) {
      showError(err.message);
    }
  };

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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={() => setIsModalOpen(true)}
        sx={{ mb: 2 }}
      >
        Добавить экземпляр
      </Button>
      <DataGrid
        rows={data?.content || []}
        columns={columns}
        autoHeight
        pagination
        paginationMode="server"
        rowCount={data?.totalElements}
        key={"24324"}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => {
          // Сохраняем текущую страницу и размер в состоянии
          setPaginationModel((prev) => ({
            ...prev,
            page: model.page !== undefined ? model.page : prev.page,
            pageSize:
              model.pageSize !== undefined ? model.pageSize : prev.pageSize,
          }));
        }}
        loading={!data && !error}
      />

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth>
        <DialogTitle>
          {formState.id === null
            ? "Добавление экземпляра"
            : "Редактирование экземпляра"}
        </DialogTitle>
        <DialogContent>
          {/* {JSON.stringify(formState)} */}
          <Autocomplete
            options={bookOptions}
            value={
              bookOptions.find((option) => option.id === formState.bookId) ||
              null
            }
            onInputChange={(event, value) => {
              handleBookSearch(value);
              if (value === "") {
                // Сброс значения, если поле очистили
                setFormState((prev) => ({
                  ...prev,
                  bookId: "",
                  bookTitle: "",
                }));
              }
            }}
            onChange={(event, value) => {
              setFormState((prev) => ({
                ...prev,
                bookId: value?.id || "",
                bookTitle: value?.label || "",
              }));
            }}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Книга"
                placeholder="Введите название книги"
                fullWidth
              />
            )}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Библиотека"
            value={formState.libraryId}
            onChange={(e) =>
              handleInputChange("libraryId")(null, e.target.value)
            }
            fullWidth
            margin="normal"
          >
            {libraries?.map((library) => (
              <MenuItem key={library.id} value={library.id}>
                {library.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Инвентарный номер"
            value={formState.inventoryNumber}
            onChange={(e) =>
              handleInputChange("inventoryNumber")(null, e.target.value)
            }
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formState.available}
                onChange={(e) => handleInputChange("available")(e)}
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
