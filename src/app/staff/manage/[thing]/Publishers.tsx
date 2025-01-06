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

export const Publishers = () => {
  const { token } = useAuth();
  const [formState, setFormState] = useState({
    name: "",
    website: "",
    email: "",
  });

  const { error, showError } = useErrorAlert();
  const { data, mutate } = useSWR(
    [`${config.API_URL}/library/publishers`, token],
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
    formState.name.trim() &&
    /^https?:\/\/[^\s]+$/.test(formState.website) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.API_URL}/library/publishers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });
      if (!response.ok) throw new Error("Ошибка при создании издателя");
      mutate();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${config.API_URL}/library/publishers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Ошибка при удалении издателя");
      mutate();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Название", flex: 3 },
    { field: "website", headerName: "Веб-сайт", flex: 3 },
    { field: "email", headerName: "Email", flex: 3 },
    {
      field: "actions",
      headerName: "Действия",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleDelete(params.row.id)}
        >
          Удалить
        </Button>
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
                label="Веб-сайт"
                value={formState.website}
                onChange={handleInputChange("website")}
              />
              <TextField
                label="Email"
                value={formState.email}
                onChange={handleInputChange("email")}
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
