"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Typography } from "@mui/material";

import { Progress } from "@/app/components/Progress";
import { useRequireAuth } from "@/app/utils/useRequireAuth";

import "./page.scss";
import { Authors } from "./Authors";
import { Genres } from "./Genres";
import { Themes } from "./Themes";
import { Publishers } from "./Publishers";
import Copies from "./Copies";
import Bookings from "./Bookings";
import Return from "./Return";
import LibraryManagementPage from "./Libraries";

const ALLOWED_PARAMS = [
  "authors",
  "genres",
  "themes",
  "publishers",
  "copies",
  "bookings",
  "return",
  "libraries",
];

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
      {thing === "genres" && <Genres />}
      {thing === "themes" && <Themes />}
      {thing === "publishers" && <Publishers />}
      {thing === "copies" && <Copies />}
      {thing === "bookings" && <Bookings />}
      {thing === "return" && <Return />}
      {thing === "libraries" && <LibraryManagementPage />}
    </div>
  );
};

export default ManagePage;
