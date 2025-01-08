"use client";
import { Button, Typography } from "@mui/material";
import { Progress } from "../components/Progress";
import { useRequireAuth } from "../utils/useRequireAuth";
import "./page.scss";
const StaffPage = () => {
  const { authenticated, loading } = useRequireAuth();

  if (loading || !authenticated) {
    return <Progress />;
  }

  const librarianMethods = [
    "authors",
    "genres",
    "themes",
    "publishers",
    "copies",
  ];

  return (
    <>
      <Typography variant="h4">Управление библиотекой</Typography>
      <Typography variant="subtitle1">
        Вам доступен функционал {true && "администратора"}
      </Typography>
      <div className="actions">
        <div className="librarian">
          <Typography className="h6">Действия библиотекаря</Typography>
          {librarianMethods.map((method) => (
            <Button
              variant="outlined"
              key={method}
              href={`/staff/manage/${method}`}
            >
              Управление {method}
            </Button>
          ))}
          <Button variant="outlined" href={`/staff/manage/book/new`}>
            Управление книгами
          </Button>
          <Button variant="outlined" href={`/staff/manage/return`}>
            Возврат
          </Button>
        </div>
        <div className="admin">
          <Typography className="h6">Действия администратора</Typography>
        </div>
      </div>
    </>
  );
};

export default StaffPage;
