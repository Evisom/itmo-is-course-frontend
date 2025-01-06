"use client";

import React, { useState } from "react";

import useSWR from "swr";
import { Card, CardContent, TextField, Button, Alert } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { Progress } from "@/app/components/Progress";
import { useAuth } from "@/app/components/AuthProvider";

import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";

import "./page.scss";
import { useErrorAlert } from "@/app/utils/useErrorAlert";

export const Genres = () => {
  const { token } = useAuth();
  const { error, showError } = useErrorAlert();
  const [formState, setFormState] = useState({
    name: "",
    popularity: "",
  });

  const { data, mutate } = useSWR(
    [`${config.API_URL}/library/genres`, token],
    ([url, token]) => fetcher(url, token)
  );

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prevState) => ({
        ...prevState,
        [field]: event.target.value,
      }));
    };

  const isValidForm = () =>
    formState.name.trim() && /^\d+$/.test(formState.popularity);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.API_URL}/library/genres`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          popularity: parseInt(formState.popularity, 10),
        }),
      });
      if (!response.ok) throw new Error("Ошибка при создании жанра");
      mutate();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${config.API_URL}/library/genres/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Ошибка при удалении жанра");
      mutate();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Название", flex: 3 },
    { field: "popularity", headerName: "Популярность", flex: 2 },
    {
      field: "actions",
      headerName: "Действия",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  if (!data) return <Progress />;

  return (
    <>
      <Card variant="outlined" className="card">
        <CardContent>
          <div className="form">
            <div className="controls">
              <TextField
                label="Название"
                value={formState.name}
                onChange={handleInputChange("name")}
              />
              <TextField
                label="Популярность"
                type="number"
                value={formState.popularity}
                onChange={handleInputChange("popularity")}
              />
            </div>

            <Button
              variant="outlined"
              disabled={!isValidForm()}
              onClick={handleSubmit}
            >
              Создать
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="alert">
        {error && <Alert severity="error">{error}</Alert>}
      </div>

      <div className="results">
        <DataGrid
          rows={data}
          columns={columns}
          hideFooterPagination
          hideFooterSelectedRowCount
        />
      </div>
    </>
  );
};
