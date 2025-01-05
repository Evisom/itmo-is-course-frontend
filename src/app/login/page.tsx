"use client";

import { useAuth } from "../components/AuthProvider";
import { Progress } from "../components/Progress";
import { Login } from "../components/Login";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authenticated && !loading) router.push("/");
  }, [authenticated, loading, router]);

  if (loading) {
    return <Progress />;
  }
  return <Login />;
};
export default LoginPage;
