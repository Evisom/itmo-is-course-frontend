"use client";

import { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

type UseRequireAuthOptions = {
  requiredRole?: string;
  redirectUrl?: string;
};

export const useRequireAuth = ({
  requiredRole = "ROLE_USER",
  redirectUrl = "/login",
}: UseRequireAuthOptions = {}) => {
  const { authenticated, loading, roles } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        router.push(redirectUrl);
      } else if (!hasAccess(requiredRole, roles)) {
        router.push(redirectUrl);
      }
    }
  }, [authenticated, loading, roles, requiredRole, redirectUrl, router]);

  const hasAccess = (requiredRole: string, userRoles: string[]): boolean => {
    if (requiredRole === "ROLE_USER") return true; // ROLE_USER доступна всем
    if (requiredRole === "ROLE_LIBRARIAN")
      return (
        userRoles.includes("ROLE_LIBRARIAN") || userRoles.includes("ROLE_ADMIN")
      );
    if (requiredRole === "ROLE_ADMIN") return userRoles.includes("ROLE_ADMIN");
    return false;
  };

  return { authenticated, loading };
};
