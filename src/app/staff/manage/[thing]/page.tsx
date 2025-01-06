"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enUS } from "date-fns/locale";

import { Progress } from "@/app/components/Progress";
import { useAuth } from "@/app/components/AuthProvider";
import { useRequireAuth } from "@/app/utils/useRequireAuth";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";

import "./page.scss";

const ALLOWED_PARAMS = ["authors", "genres", "themes", "publishers"];

const ManagePage = ({ params }: { params: any }) => {
  const { thing } = React.use(params);
  const router = useRouter();
  const { loading } = useRequireAuth();

  if (!ALLOWED_PARAMS.includes(thing)) {
    router.back();
    return null;
  }

  if (loading) {
    return <Progress />;
  }

  return (
    <div>
      <Typography variant="h4">{`Управление ${thing}`}</Typography>
      {thing === "authors" && <Authors />}
    </div>
  );
};

const Authors = () => {
  const { token } = useAuth();
  const [formState, setFormState] = useState({
    name: "",
    surname: "",
    birthDate: "",
  });

  const { data, mutate, error } = useSWR(
    [`${config.API_URL}/library/authors`, token],
    ([url, token]) => fetcher(url, token)
  );

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prevState) => ({
        ...prevState,
        [field]: event.target.value,
      }));
    };

  const handleDateChange = (newValue: Date | null) => {
    if (newValue) {
      const formattedDate = newValue.toISOString().split("T")[0];
      setFormState({ ...formState, birthDate: formattedDate });
    } else {
      setFormState({ ...formState, birthDate: "" });
    }
  };

  const isValidForm = () =>
    /^\d{4}-\d{2}-\d{2}$/.test(formState.birthDate) &&
    formState.name.trim() &&
    formState.surname.trim();

  const handleSubmit = async () => {
    await fetch(`${config.API_URL}/library/authors`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });
    mutate();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${config.API_URL}/library/authors/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    mutate();
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Имя", flex: 3 },
    { field: "surname", headerName: "Фамилия", flex: 3 },
    { field: "birthDate", headerName: "Дата рождения", flex: 4 },
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
                label="Имя"
                value={formState.name}
                onChange={handleInputChange("name")}
              />
              <TextField
                label="Фамилия"
                value={formState.surname}
                onChange={handleInputChange("surname")}
              />
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={enUS}
              >
                <DateField
                  label="Дата рождения"
                  format="yyyy-MM-dd"
                  value={
                    formState.birthDate ? new Date(formState.birthDate) : null
                  }
                  slotProps={{ textField: { error: false } }}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
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

export default ManagePage;
