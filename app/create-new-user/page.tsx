"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createUserInDb } from "@/lib/actions";
import Loader from "@/components/Loader";

export default function CreateNewUser() {
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        await createUserInDb();
        router.push("/");
      } catch (error) {
        console.error("Error creating user:", error);
      }
    };

    initialize();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="absolute inset-0 z-50 bg-gray-900/30 backdrop-blur-xs">
        <div
          role="status"
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        >
          <Loader />
          <span className="font-bold mt-2 animate-pulse">Signing You In</span>
        </div>
      </div>
    </div>
  );
}
