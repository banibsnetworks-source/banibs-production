/**
 * GUEST-ONLY Index Entry Point
 * 
 * Uses GuestApp (no auth) instead of full App
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import "./index.css";
import "./styles/theme.css";
import "./styles/profile-themes.css";
import GuestApp from "./GuestApp";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <GuestApp />
    </HelmetProvider>
  </React.StrictMode>,
);
