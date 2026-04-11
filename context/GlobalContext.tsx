"use client";

import { on } from "events";
import { createContext, useCallback, useMemo, useState } from "react";

interface GlobalContextProps {
  isEditing: boolean;
  isDev: boolean;
  handleSetEditing: () => void;
  onNavbarItemHover?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  setOnNavbarItemHover: (callback: (e: React.MouseEvent<HTMLAnchorElement>) => void) => void;
}

const GlobalContext = createContext<GlobalContextProps | null>(null);

const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [onNavbarItemHover, setOnNavbarItemHover] = useState<(e: React.MouseEvent<HTMLAnchorElement>) => void>();

  const handleSetEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  const contextValue = useMemo<GlobalContextProps>(
    () => ({
      isEditing,
      isDev: process.env.NODE_ENV === "development",
      handleSetEditing,
      onNavbarItemHover,
      setOnNavbarItemHover,
    }),
    [isEditing, handleSetEditing, onNavbarItemHover, setOnNavbarItemHover]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContextProvider, GlobalContext };