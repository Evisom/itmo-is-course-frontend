"use client";
import { useAuth } from "./components/AuthProvider";
import { Login } from "./components/Login";
import { Progress } from "./components/Progress";

export default function Home() {
  const { login, username, token, authenticated, loading } = useAuth();

  if (loading) {
    return <Progress />;
  }

  if (authenticated) {
    return (
      <div>
        {username}, вы залогинены, токен: {token}
      </div>
    );
  }

  return <Login />;
}
