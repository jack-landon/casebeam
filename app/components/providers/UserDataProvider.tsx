"use client";

import { createContext, useContext, useState } from "react";
import { getUserData } from "@/lib/db/queries/query";

export type UserData = Awaited<ReturnType<typeof getUserData>>;

type UserDataContextType = {
  userData: UserData | null;
  refreshUserData: () => Promise<void>;
  isLoadingUserData: boolean;
};

export const UserDataContext = createContext<UserDataContextType>({
  userData: null,
  refreshUserData: async () => {},
  isLoadingUserData: false,
});

export const useUserData = () => useContext(UserDataContext);

export function UserDataProvider({
  children,
  initialUserData = null,
}: {
  children: React.ReactNode;
  initialUserData: UserData | null;
}) {
  const [userData, setUserData] = useState(initialUserData);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const refreshUserData = async () => {
    setIsLoadingUserData(true);
    try {
      const freshData = await getUserData();
      setUserData(freshData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  return (
    <UserDataContext.Provider
      value={{ userData, refreshUserData, isLoadingUserData }}
    >
      {children}
    </UserDataContext.Provider>
  );
}
