"use client";
import { Progress } from "@/app/components/Progress";
import { useRequireAuth } from "@/app/utils/useRequireAuth";
import { useRouter } from "next/navigation";

const ManagePage = ({ params }: { params: any }) => {
  const { thing } = params;
  const allowedParams = ["authors", "genres", "themes", "publishers"];
  const { loading } = useRequireAuth();
  const router = useRouter();

  if (!allowedParams.includes(thing)) {
    router.back();
  }

  if (loading) {
    return <Progress />;
  }
  return <>{thing}</>;
};

export default ManagePage;
