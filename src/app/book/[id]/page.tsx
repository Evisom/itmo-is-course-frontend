"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
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
  TextField,
  Rating,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";
import { Progress } from "@/app/components/Progress";
import BookCover from "@/app/components/BookCover";

const BookPage = ({ params }: { params: { id: string } }) => {
  const { id } = React.use(params);
  const { token, roles } = useAuth();

  const { data: bookData, error: bookError } = useSWR(
    [`${config.API_URL}/library/books/${id}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const { data: reviewsData, error: reviewsError } = useSWR(
    [`${config.API_URL}/operations/reviews/${id}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const { data: librariesData, error: librariesError } = useSWR(
    [`${config.API_URL}/library/allLibraries`, token],
    ([url, token]) => fetcher(url, token)
  );

  const { data: readingStatus } = useSWR(
    [`${config.API_URL}/operations/readingStatus?bookId=${id}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const [newReview, setNewReview] = useState({
    ratingValue: 0,
    review: "",
  });

  const [reserving, setReserving] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // Can be 'success' or 'error'
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleReserve = async (libraryId: number) => {
    setReserving(libraryId);
    try {
      const status = await fetch(
        `${config.API_URL}/operations/books/${id}/reserve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ libraryId }),
        }
      );
      if (status.status === 200) {
        setSnackbar({
          open: true,
          message: "Книга успешно забронирована",
          severity: "success",
        });
      } else {
        throw new Error("Ошибка при бронировании");
      }
    } catch (error) {
      console.error("Ошибка при бронировании:", error);
      setSnackbar({
        open: true,
        message: "Не удалось забронировать книгу",
        severity: "error",
      });
    } finally {
      setReserving(null);
    }
  };

  const groupedCopies = bookData?.copies?.reduce((acc, copy) => {
    if (!acc[copy.libraryId]) {
      acc[copy.libraryId] = {
        libraryId: copy.libraryId,
        count: 0,
        available: 0,
      };
    }
    acc[copy.libraryId].count += 1;
    if (copy.available) {
      acc[copy.libraryId].available += 1;
    }
    return acc;
  }, {});

  const groupedData = Object.values(groupedCopies || {});

  const handleReviewChange = (field, value) => {
    setNewReview((prev) => ({ ...prev, [field]: value }));
  };

  const handleReviewSubmit = async () => {
    await fetch(`${config.API_URL}/operations/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId: Number(id),
        ...newReview,
      }),
    });
    mutate([`${config.API_URL}/operations/reviews/${id}`, token]);
    setNewReview({ ratingValue: 0, review: "" });
  };

  if (!bookData || !reviewsData || !librariesData) return <Progress />;
  if (bookError || reviewsError || librariesError)
    return <Typography color="error">Ошибка загрузки данных</Typography>;

  const getLibraryName = (libraryId) => {
    const library = librariesData.find((lib) => lib.id === libraryId);
    return library ? library.name : "Неизвестная библиотека";
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* Book Details */}
      <Card>
        <BookCover
          title={bookData.title}
          authors={bookData.authors.map(
            (author) => `${author.name} ${author.surname}`
          )}
          id={bookData.id}
        />
        <CardContent>
          <Typography variant="h4">{bookData.title}</Typography>
          <Typography>
            <strong>Год публикации:</strong> {bookData.yearPublished}
          </Typography>
          <Typography>
            <strong>Автор(ы):</strong>{" "}
            {bookData.authors.length > 0
              ? bookData.authors
                  .map((author) => `${author.name} ${author.surname}`)
                  .join(", ")
              : "Не указаны"}
          </Typography>
          <Typography>
            <strong>Жанр:</strong> {bookData.genre?.name || "Не указан"}
          </Typography>
          <Typography>
            <strong>Тема:</strong> {bookData.theme?.name || "Не указана"}
          </Typography>
          <Typography>
            <strong>Издатель:</strong> {bookData.publisher?.name || "Не указан"}
          </Typography>
          <Typography>
            <strong>ISBN:</strong> {bookData.isbn}
          </Typography>
          {bookData.rating !== 0 && <Rating value={bookData.rating} />}
          {(roles.includes("ROLE_ADMIN") ||
            roles.includes("ROLE_LIBRARIAN")) && (
            <Button
              sx={{ marginTop: "12px" }}
              variant="outlined"
              href={"/staff/manage/book/" + bookData.id}
            >
              редактировать
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Library Copies */}
      <Typography
        variant="h5"
        style={{ marginBottom: "16px", marginTop: "16px" }}
      >
        Экземпляры в библиотеках
      </Typography>
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Библиотека</TableCell>
              <TableCell>Всего экземпляров</TableCell>
              <TableCell>Доступно</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedData.length > 0 ? (
              groupedData.map((group) => (
                <TableRow key={group.libraryId}>
                  <TableCell>{getLibraryName(group.libraryId)}</TableCell>
                  <TableCell>{group.count}</TableCell>
                  <TableCell>{group.available}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleReserve(group.libraryId)}
                      disabled={reserving === group.libraryId}
                    >
                      {reserving === group.libraryId
                        ? "Бронирование..."
                        : "Забронировать"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Нет экземпляров
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Review */}
      <Typography
        variant="h5"
        style={{ marginBottom: "16px", marginTop: "16px" }}
      >
        Добавить отзыв
      </Typography>
      <Card>
        <CardContent>
          <Box>
            <Typography>Рейтинг</Typography>
            <Rating
              value={newReview.ratingValue}
              onChange={(e, value) => handleReviewChange("ratingValue", value)}
            />
          </Box>
          <TextField
            label="Отзыв"
            multiline
            rows={4}
            fullWidth
            value={newReview.review}
            onChange={(e) => handleReviewChange("review", e.target.value)}
            style={{ marginTop: "10px" }}
          />
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: "10px" }}
            onClick={handleReviewSubmit}
            disabled={!newReview.ratingValue || !newReview.review.trim()}
          >
            Отправить
          </Button>
        </CardContent>
      </Card>

      {/* Reviews */}
      {readingStatus.includes("RETURNED")}
      <Typography variant="h5" style={{ marginTop: "20px" }}>
        Отзывы
      </Typography>
      {reviewsData.map((review) => (
        <Card
          key={review.id}
          style={{ marginBottom: "16px", marginTop: "16px" }}
        >
          <CardContent>
            <Rating value={review.ratingValue} readOnly />
            <Typography>{review.review || "Без текста"}</Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(review.time).toLocaleString() || "Неизвестное время"}
            </Typography>
          </CardContent>
        </Card>
      ))}

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

export default BookPage;
