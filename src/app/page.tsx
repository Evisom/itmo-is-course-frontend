"use client";
import { useAuth } from "./components/AuthProvider";
import { Progress } from "./components/Progress";
import { useRequireAuth } from "./utils/useRequireAuth";

export default function Home() {
  const { authenticated, loading } = useRequireAuth();
  const { username, token } = useAuth();
  if (loading) {
    return <Progress />;
  }

  return (
    <div>
      вы залогинены {username} {String(authenticated)} {token}
    </div>
  );
}
