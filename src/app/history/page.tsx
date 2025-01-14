"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Rating,
  Link,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import { useAuth } from "../components/AuthProvider";
import { fetcher } from "../utils/fetcher";
import { config } from "../utils/config";
import { Progress } from "../components/Progress";
import { useSearchParams } from "next/navigation";

const UserHistoryPage = () => {
  const searchParams = useSearchParams();

  const userEmail = searchParams.get("email");
  const { email, token } = useAuth();
  const { data: historyData, mutate } = useSWR(
    email
      ? [
          `${config.API_URL}/operations/history?email=${
            token ? (userEmail ? userEmail : email) : null
          }`,
          token,
        ]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(
        `${config.API_URL}/operations/transaction/cancel/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Бронирование успешно отменено",
          severity: "success",
        });
        mutate();
      } else {
        throw new Error("Ошибка при отмене бронирования");
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  if (!historyData) {
    return <Progress />;
  }

  const getChipColor = (status) => {
    switch (status) {
      case "REJECTED": {
        return "error";
      }
      case "APPROVED": {
        return "success";
      }
      case "PENDING": {
        return "primary";
      }
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <Typography variant="h4">История пользователя {userEmail}</Typography>
      {!historyData?.length && (
        <Typography>
          Пользователя с такой почтой нет или он не сделал ни одного действия
        </Typography>
      )}
      <Grid container spacing={2} sx={{ marginTop: "24px" }}>
        {historyData.map((item) => (
          <Grid item xs={12} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="textSecondary">
                  {new Date(item.time).toLocaleString()}
                </Typography>
                {item.type === "Rating" && (
                  <>
                    <Typography variant="h6">Отзыв</Typography>
                    <Rating value={item.ratingValue} readOnly />
                    <Typography>{item.review || "Без текста"}</Typography>
                    <Typography>
                      Книга: {item.title} —{" "}
                      {item.author
                        .map((a) => `${a.name} ${a.surname}`)
                        .join(", ")}
                    </Typography>
                  </>
                )}
                {item.type === "BookTransaction" && (
                  <>
                    <Typography variant="h6">Бронирование книги</Typography>
                    <Typography>
                      Книга: {item.title} —{" "}
                      {item.author
                        .map((a) => `${a.name} ${a.surname}`)
                        .join(", ")}
                    </Typography>
                    <Typography>
                      Библиотека: {item.library?.name || "Не указана"}
                    </Typography>
                    <Typography>Инвентарный номер: {item.invNumber}</Typography>

                    <Chip
                      sx={{ margin: "12px 0" }}
                      label={item.status}
                      color={getChipColor(item.status)}
                      variant="outlined"
                    />
                    {item.comment && (
                      <Typography>Комментарий: {item.comment}</Typography>
                    )}
                    {item.status === "PENDING" && (
                      <Button
                        sx={{ marginTop: "16px" }}
                        variant="contained"
                        fullWidth
                        color="error"
                        onClick={() => handleCancel(item.id)}
                      >
                        Отменить
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
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

export default UserHistoryPage;
