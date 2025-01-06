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
import { Authors } from "./Authors";
import { Genres } from "./Genres";

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
      {thing === "genres" && <Genres />}
    </div>
  );
};

export default ManagePage;
