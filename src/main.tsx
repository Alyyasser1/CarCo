// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import AuthContextProvider from "./context/AuthContextProvider";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <AuthContextProvider>
    <App />
  </AuthContextProvider>,
  // </StrictMode>,
);
