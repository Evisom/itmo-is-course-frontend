"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  Checkbox,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  ListItemText,
  Box,
  Slider,
  FormControlLabel,
  Grid,
  CardMedia,
  Link,
} from "@mui/material";
import useSWR from "swr";
import { useAuth } from "./components/AuthProvider";
import { Progress } from "./components/Progress";
import { useRequireAuth } from "./utils/useRequireAuth";
import { config } from "./utils/config";
import { fetcher } from "./utils/fetcher";
import "./page.scss";
import BookCover from "./components/BookCover";

export default function Home() {
  const { authenticated, loading } = useRequireAuth();
  const { token } = useAuth();

  const [filterState, setFilterState] = useState({
    name: "",
    genres: [],
    themes: [],
    publishers: [],
    authors: [],
    minCopies: 0,
    maxCopies: 999,
    rating: 5,
    popularity: "asc",
    available: true,
  });

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

  const { data: booksData } = useSWR(
    [`${config.API_URL}/library/find`, token],
    ([url, token]) => fetcher(url, token)
  );

  const handleFilterChange = (field, value) => {
    setFilterState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    // Implement search functionality using `filterState`
    console.log("Applying filters:", filterState);
  };

  if (loading) {
    return <Progress />;
  }

  return (
    <div>
      <Typography variant="h4">Список книг</Typography>
      <div className="books">
        <div className="filters">
          <Card>
            <CardContent>
              <Typography variant="h5">Фильтры</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="genres-select-label">Жанры</InputLabel>
                <Select
                  labelId="genres-select-label"
                  multiple
                  value={filterState.genres}
                  onChange={(e) => handleFilterChange("genres", e.target.value)}
                  renderValue={(selected) =>
                    selected
                      .map(
                        (id) =>
                          genresData?.find((genre) => genre.id === id)?.name
                      )
                      .join(", ")
                  }
                >
                  {genresData?.map((genre) => (
                    <MenuItem key={genre.id} value={genre.id}>
                      <Checkbox
                        checked={filterState.genres.includes(genre.id)}
                      />
                      <ListItemText primary={genre.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="themes-select-label">Темы</InputLabel>
                <Select
                  labelId="themes-select-label"
                  multiple
                  value={filterState.themes}
                  onChange={(e) => handleFilterChange("themes", e.target.value)}
                  renderValue={(selected) =>
                    selected
                      .map(
                        (id) =>
                          themesData?.find((theme) => theme.id === id)?.name
                      )
                      .join(", ")
                  }
                >
                  {themesData?.map((theme) => (
                    <MenuItem key={theme.id} value={theme.id}>
                      <Checkbox
                        checked={filterState.themes.includes(theme.id)}
                      />
                      <ListItemText primary={theme.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="publishers-select-label">Издатели</InputLabel>
                <Select
                  labelId="publishers-select-label"
                  multiple
                  value={filterState.publishers}
                  onChange={(e) =>
                    handleFilterChange("publishers", e.target.value)
                  }
                  renderValue={(selected) =>
                    selected
                      .map(
                        (id) =>
                          publishersData?.find(
                            (publisher) => publisher.id === id
                          )?.name
                      )
                      .join(", ")
                  }
                >
                  {publishersData?.map((publisher) => (
                    <MenuItem key={publisher.id} value={publisher.id}>
                      <Checkbox
                        checked={filterState.publishers.includes(publisher.id)}
                      />
                      <ListItemText primary={publisher.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="authors-select-label">Авторы</InputLabel>
                <Select
                  labelId="authors-select-label"
                  multiple
                  value={filterState.authors}
                  onChange={(e) =>
                    handleFilterChange("authors", e.target.value)
                  }
                  renderValue={(selected) =>
                    selected
                      .map((id) =>
                        authorsData?.find((author) => author.id === id)
                      )
                      .map((author) => `${author?.name} ${author?.surname}`)
                      .join(", ")
                  }
                >
                  {authorsData?.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      <Checkbox
                        checked={filterState.authors.includes(author.id)}
                      />
                      <ListItemText
                        primary={`${author.name} ${author.surname}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography gutterBottom>Количество экземпляров</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={[filterState.minCopies, filterState.maxCopies]}
                  onChange={(e, value) => {
                    handleFilterChange("minCopies", value[0]);
                    handleFilterChange("maxCopies", value[1]);
                  }}
                  valueLabelDisplay="auto"
                  step={1}
                  min={0}
                  max={1000}
                />
              </Box>
              <Typography gutterBottom>Рейтинг</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filterState.rating}
                  onChange={(e, value) => handleFilterChange("rating", value)}
                  valueLabelDisplay="auto"
                  step={1}
                  min={1}
                  max={5}
                />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterState.available}
                    onChange={(e) =>
                      handleFilterChange("available", e.target.checked)
                    }
                  />
                }
                label="Доступно"
              />
            </CardContent>
          </Card>
        </div>
        <div className="results">
          <div className="results-controls">
            <TextField
              label="Поиск по имени"
              size="small"
              fullWidth
              value={filterState.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              margin="normal"
            />
            {/* <InputLabel id="popularity-select-label">Популярность</InputLabel> */}
            <Select
              labelId="popularity-select-label"
              value={filterState.popularity}
              onChange={(e) => handleFilterChange("popularity", e.target.value)}
              size="small"
            >
              <MenuItem value="asc">По возрастанию</MenuItem>
              <MenuItem value="desc">По убыванию</MenuItem>
            </Select>

            <Button variant="outlined" onClick={handleSearch} size="large">
              Искать
            </Button>
          </div>
          <div className="results-body">
            {JSON.stringify(filterState)}

            <Grid container spacing={2}>
              {booksData?.map((book) => (
                <Grid item xs={12} sm={6} md={4} key={book.id}>
                  <Card>
                    <Link
                      href={`/book/${book.id}`}
                      sx={{ textDecoration: "none" }}
                    >
                      <BookCover
                        title={book.title}
                        authors={book.authors.map(
                          (author) => `${author.name} ${author.surname}`
                        )}
                        id={book.id}
                      />
                    </Link>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {book.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Автор(ы):{" "}
                        {book.authors.length > 0
                          ? book.authors
                              .map(
                                (author) => `${author.name} ${author.surname}`
                              )
                              .join(", ")
                          : "Не указан"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Жанр: {book.genre?.name || "Не указан"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Тема: {book.theme?.name || "Не указана"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Издатель: {book.publisher?.name || "Не указан"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
}
