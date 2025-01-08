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
} from "@mui/material";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";
import { Progress } from "@/app/components/Progress";
import BookCover from "@/app/components/BookCover";

const BookPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { token } = useAuth();

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

  const [newReview, setNewReview] = useState({
    ratingValue: 0,
    review: "",
  });

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
          <Button
            sx={{ marginTop: "12px" }}
            variant="outlined"
            href={"/staff/manage/book/" + bookData.id}
          >
            редактировать
          </Button>
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
              <TableCell>Количество экземпляров</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookData.copies.length > 0 ? (
              bookData.copies.map((copy) => (
                <TableRow key={copy.id}>
                  <TableCell>{getLibraryName(copy.libraryId)}</TableCell>
                  <TableCell>1</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
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
    </div>
  );
};

export default BookPage;
