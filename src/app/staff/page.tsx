"use client";
import { Typography } from "@mui/material";
import { Progress } from "../components/Progress";
import { useRequireAuth } from "../utils/useRequireAuth";
import "./page.scss";
const StaffPage = () => {
  const { authenticated, loading } = useRequireAuth();

  if (loading || !authenticated) {
    return <Progress />;
  }

  return (
    <>
      <Typography variant="h4">Управление библиотекой</Typography>
      <Typography variant="subtitle1">
        Вам доступен функционал {true && "администратора"}
      </Typography>
      <div className="actions">
        <div className="librarian">
          <Typography className="h6">Действия библиотекаря</Typography>
        </div>
        <div className="admin">
          <Typography className="h6">Действия администратора</Typography>
        </div>
      </div>
    </>
  );
};

export default StaffPage;
