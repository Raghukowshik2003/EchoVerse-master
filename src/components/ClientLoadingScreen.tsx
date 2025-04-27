// src/components/ClientLoadingScreen.tsx
"use client"; // Ensure this is a client-side component

import React, { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen"; // Import the LoadingScreen component

interface ClientLoadingScreenProps {
  children: React.ReactNode;
}

const ClientLoadingScreen: React.FC<ClientLoadingScreenProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Display the loading screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? <LoadingScreen /> : children}
    </>
  );
};

export default ClientLoadingScreen;
