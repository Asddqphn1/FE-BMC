import React, { useState, useEffect } from "react";
import { NativeRouter, Routes, Route } from "react-router-native";
import { View, Text } from "react-native";
import SplashScreen from "./page/splashScreen/SplashScreen";
import HomeScreen from "./page/LoginScreen/LoginScreen";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Saat loading tampilkan SplashScreen
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        {/* kamu bisa tambahkan route lain */}
        <Route path="/about" element={<Text>About Page</Text>} />
      </Routes>
    </NativeRouter>
  );
}
