import React, { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Autocomplete,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { fetcher } from "@/app/utils/fetcher";
import { config } from "@/app/utils/config";
import { useAuth } from "@/app/components/AuthProvider";
import { useErrorAlert } from "@/app/utils/useErrorAlert";
import { useRouter } from "next/navigation";
import { Progress } from "@/app/components/Progress";

const Book = ({ type, id = -1 }) => {
  const router = useRouter();

  const { token } = useAuth();
  const { error, showError } = useErrorAlert();

  const { data: publishersData } = useSWR(
    [`${config.API_URL}/library/publishers`, token],
    ([url, token]) => fetcher(url, token)
  );
  const { data: themesData } = useSWR(
    [`${config.API_URL}/library/themes`, token],
    ([url, token]) => fetcher(url, token)
  );
  const { data: authorsData } = useSWR(
    [`${config.API_URL}/library/authors`, token],
    ([url, token]) => fetcher(url, token)
  );
  const { data: genresData } = useSWR(
    [`${config.API_URL}/library/genres`, token],
    ([url, token]) => fetcher(url, token)
  );

  const { data: bookData } = useSWR(
    type === "edit" ? [`${config.API_URL}/library/books/${id}`, token] : null,
    ([url, token]) => fetcher(url, token)
  );

  const [bookState, setBookState] = useState({
    title: "",
    publisher: null,
    theme: null,
    authors: null,
    genre: null,
    yearPublished: "",
    isbn: "",
  });

  useEffect(() => {
    if (type === "edit" && bookData) {
      setBookState({
        title: bookData.title || "",
        publisher:
          publishersData?.find((p) => p.id === bookData?.publisher?.id) || null,
        theme: themesData?.find((t) => t.id === bookData?.theme?.id) || null,
        authors:
          authorsData?.find((a) => a.id === bookData?.authors[0]?.id) || null,
        genre: genresData?.find((g) => g.id === bookData?.genre?.id) || null,
        yearPublished: bookData.yearPublished || "",
        isbn: bookData.isbn || "",
      });
    }
  }, [type, bookData, publishersData, themesData, authorsData, genresData]);

  const handleAutocompleteChange = (field) => (event, newValue) => {
    setBookState((prevState) => ({
      ...prevState,
      [field]: newValue,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBookState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const url =
      type === "new"
        ? `${config.API_URL}/library/newBook`
        : `${config.API_URL}/library/books/${id}`;
    const method = type === "new" ? "POST" : "PUT";

    const payload = {
      title: bookState.title,
      publisher: bookState.publisher || null,
      theme: bookState.theme || null,
      authors: [bookState.authors],
      genre: bookState.genre || null,
      yearPublished: bookState.yearPublished,
      isbn: bookState.isbn,
    };

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Не получается сохранить книгу");
        router.back();
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const handleDelete = () => {
    fetch(`${config.API_URL}/library/books/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Не получается удалить книгу");
        router.back();
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  if (
    !(
      publishersData &&
      themesData &&
      authorsData &&
      genresData &&
      (bookData || type === "new")
    )
  ) {
    return <Progress />;
  }
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" gutterBottom>
          {type === "new" ? "Создание новой книги" : "Редактирование книги"}
        </Typography>
        {type === "edit" && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            sx={{ height: "fit-content" }}
          >
            Удалить
          </Button>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Название книги"
        name="title"
        value={bookState.title}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Год публикации"
        name="yearPublished"
        type="number"
        value={bookState.yearPublished}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="ISBN"
        name="isbn"
        value={bookState.isbn}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <Autocomplete
        options={publishersData || []}
        getOptionLabel={(option) => option.name}
        value={bookState.publisher}
        onChange={handleAutocompleteChange("publisher")}
        renderInput={(params) => (
          <TextField {...params} label="Издатель" margin="normal" fullWidth />
        )}
      />
      <Autocomplete
        options={themesData || []}
        getOptionLabel={(option) => option.name}
        value={bookState.theme}
        onChange={handleAutocompleteChange("theme")}
        renderInput={(params) => (
          <TextField {...params} label="Тема" margin="normal" fullWidth />
        )}
      />
      <Autocomplete
        options={authorsData || []}
        getOptionLabel={(option) => `${option.name} ${option.surname}`}
        value={bookState.authors}
        onChange={handleAutocompleteChange("authors")}
        renderInput={(params) => (
          <TextField {...params} label="Автор" margin="normal" fullWidth />
        )}
      />
      <Autocomplete
        options={genresData || []}
        getOptionLabel={(option) => option.name}
        value={bookState.genre}
        onChange={handleAutocompleteChange("genre")}
        renderInput={(params) => (
          <TextField {...params} label="Жанр" margin="normal" fullWidth />
        )}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 3 }}
      >
        {type === "new" ? "Создать книгу" : "Сохранить изменения"}
      </Button>
    </Box>
  );
};

export default Book;
