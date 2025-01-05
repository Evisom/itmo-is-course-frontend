"use client";

import { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

type UseRequireAuthOptions = {
  requiredRole?: string;
  redirectUrl?: string;
};

export const useRequireAuth = ({
  requiredRole,
  redirectUrl = "/login",
}: UseRequireAuthOptions = {}) => {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        router.push(redirectUrl);
      } else {
        // на будущее - проверка ролей
      }
    }
  }, [authenticated, loading, requiredRole, redirectUrl, router]);

  return { authenticated, loading };
};
