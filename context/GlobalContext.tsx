"use client";

import { createContext, useCallback, useMemo, useState } from "react";

interface GlobalContextProps {
  isEditing: boolean;
  handleSetEditing: () => void;
  isDev: boolean;
}

const GlobalContext = createContext<GlobalContextProps | null>(null);

const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleSetEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  const contextValue = useMemo<GlobalContextProps>(
    () => ({ isEditing, handleSetEditing, isDev: process.env.NODE_ENV === "development" }),
    [isEditing, handleSetEditing]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContextProvider, GlobalContext };