/**
 * GUEST-ONLY App Entry Point
 * 
 * This is a minimal build for the public guest/marketing site.
 * NO authentication, NO login flows, NO protected routes.
 * 
 * Routes:
 * - / -> CirclesPage (guest home)
 * - /foundation -> FoundationPage
 * - /about -> BanibsHomePage
 * - All other routes -> redirect to /
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";

// Guest pages only - NO auth imports
import CirclesPage from "./pages/CirclesPage";
import FoundationPage from "./pages/FoundationPage";
import BanibsHomePage from "./pages/BanibsHomePage";

import "./App.css";

function GuestApp() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest Home - NO AUTH */}
          <Route path="/" element={<CirclesPage />} />
          
          {/* Foundation pages */}
          <Route path="/foundation" element={<FoundationPage />} />
          <Route path="/about" element={<BanibsHomePage />} />
          <Route path="/circles" element={<CirclesPage />} />
          
          {/* Catch-all: redirect everything else to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default GuestApp;
