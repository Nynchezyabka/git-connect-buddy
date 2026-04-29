import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";
import { initPwaUpdates } from "./lib/pwaUpdate";

initPwaUpdates();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" richColors />
  </React.StrictMode>
);
