"use client";

import React from "react";
import Book from "./Book";
import { useRequireAuth } from "@/app/utils/useRequireAuth";
import { Progress } from "@/app/components/Progress";

const BookPage = ({ params }: { params: any }) => {
  const { id } = React.use(params);
  const { loading } = useRequireAuth();

  if (loading) {
    return <Progress />;
  }

  if (id === "new") {
    return <Book type={"new"} />;
  }
  return <Book type={"edit"} id={id} />;
};

export default BookPage;
