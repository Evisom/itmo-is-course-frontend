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
  Link,
  Pagination,
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
  const { token, roles, userId } = useAuth();

  const [filterState, setFilterState] = useState({
    name: "",
    genres: [],
    themes: [],
    publishers: [],
    authors: [],
    minCopies: 0,
    maxCopies: 100,
    rating: [1, 5],
    popularity: "asc",
    available: true,
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 6,
  });

  const { data: publishersData } = useSWR(
    [token ? `${config.API_URL}/library/publishers` : null, token],
    ([url, token]) => fetcher(url, token)
  );
  const { data: themesData } = useSWR(
    [token ? `${config.API_URL}/library/themes` : null, token],
    ([url, token]) => fetcher(url, token)
  );
  const { data: authorsData } = useSWR(
    [token ? `${config.API_URL}/library/authors` : null, token],
    ([url, token]) => fetcher(url, token)
  );
  const { data: genresData } = useSWR(
    [token ? `${config.API_URL}/library/genres` : null, token],
    ([url, token]) => fetcher(url, token)
  );

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value - 1 }));
  };

  const createQueryString = () => {
    const params = new URLSearchParams();

    if (filterState.name) params.append("name", filterState.name);
    // if (filterState.popularity)
    //   params.append("popularity", filterState.popularity);
    // if (filterState.available !== undefined)
    //   params.append("available", filterState.available.toString());
    if (filterState.minCopies)
      params.append("minCopies", filterState.minCopies.toString());
    if (filterState.maxCopies)
      params.append("maxCopies", filterState.maxCopies.toString());
    if (filterState.rating[0])
      params.append(
        "ratingMIN",
        (filterState.rating[0] === 1 ? "0" : filterState.rating[0]).toString()
      );
    if (filterState.rating[1])
      params.append("ratingMAX", filterState.rating[1].toString());

    filterState.genres.forEach((genre) => params.append("genres", genre));
    filterState.themes.forEach((theme) => params.append("themes", theme));
    filterState.publishers.forEach((publisher) =>
      params.append("publishers", publisher)
    );
    filterState.authors.forEach((author) => params.append("authors", author));

    params.append("page", pagination.page.toString());
    params.append("size", pagination.size.toString());

    return params.toString();
  };

  const { data: booksData, isValidating } = useSWR(
    [
      token ? `${config.API_URL}/library/find?${createQueryString()}` : null,
      token,
    ],
    ([url, token]) => fetcher(url, token),
    { revalidateOnFocus: false }
  );

  const handleFilterChange = (field, value) => {
    setFilterState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    // Trigger SWR revalidation
    mutate([`${config.API_URL}/library/find?${createQueryString()}`, token]);
  };

  if (loading) {
    return <Progress />;
  }

  return (
    <div>
      <Typography variant="h4">Список книг </Typography>
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
                  renderValue={(selected) => selected.join(", ")}
                >
                  {genresData?.map((genre) => (
                    <MenuItem key={genre.id} value={genre.name}>
                      <Checkbox
                        checked={filterState.genres.includes(genre.name)}
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
                  renderValue={(selected) => selected.join(", ")}
                >
                  {themesData?.map((theme) => (
                    <MenuItem key={theme.id} value={theme.name}>
                      <Checkbox
                        checked={filterState.themes.includes(theme.name)}
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
                  renderValue={(selected) => selected.join(", ")}
                >
                  {publishersData?.map((publisher) => (
                    <MenuItem key={publisher.id} value={publisher.name}>
                      <Checkbox
                        checked={filterState.publishers.includes(
                          publisher.name
                        )}
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
                  renderValue={(selected) => selected.join(", ")}
                >
                  {authorsData?.map((author) => (
                    <MenuItem
                      key={author.id}
                      value={`${author.name} ${author.surname}`}
                    >
                      <Checkbox
                        checked={filterState.authors.includes(
                          `${author.name} ${author.surname}`
                        )}
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
                  step={5}
                  min={0}
                  max={100}
                />
              </Box>
              <Typography gutterBottom>Рейтинг</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filterState.rating}
                  onChange={(e, value) => handleFilterChange("rating", value)}
                  valueLabelDisplay="auto"
                  step={0.1}
                  min={1}
                  max={5}
                />
              </Box>
              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={filterState.available}
                    onChange={(e) =>
                      handleFilterChange("available", e.target.checked)
                    }
                  />
                }
                label="Доступно"
              /> */}
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
            {/* <Select
              labelId="popularity-select-label"
              value={filterState.popularity}
              onChange={(e) => handleFilterChange("popularity", e.target.value)}
              size="small"
            >
              <MenuItem value="asc">По возрастанию</MenuItem>
              <MenuItem value="desc">По убыванию</MenuItem>
            </Select> */}
            <Button variant="outlined" onClick={handleSearch} size="large">
              Искать
            </Button>
          </div>
          <div className="results-body" style={{ marginTop: 24 }}>
            {isValidating ? (
              <Progress />
            ) : (
              <>
                {booksData?.content?.length ? (
                  <>
                    <Grid container spacing={2}>
                      {booksData?.content?.map((book) => (
                        <Grid item xs={12} sm={6} md={4} key={book.id}>
                          <Card sx={{ height: "404px" }}>
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
                              <Typography variant="h6">{book.title}</Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Автор:{" "}
                                {book.authors.length > 0
                                  ? book.authors
                                      .map(
                                        (author) =>
                                          `${author.name} ${author.surname}`
                                      )
                                      .join(", ")
                                  : "Не указан"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Жанр: {book.genre?.name || "Не указан"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Тема: {book.theme?.name || "Не указана"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Издатель: {book.publisher?.name || "Не указан"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Рейтинг: {book.rating || "-"}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <Pagination
                        count={Math.ceil(
                          (booksData?.totalElements || 1) / pagination.size
                        )}
                        page={pagination.page + 1}
                        onChange={handlePageChange}
                      />
                    </Box>
                  </>
                ) : (
                  <>Таких книг нет</>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
