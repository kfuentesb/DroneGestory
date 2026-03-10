import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import "./index.css";
import App from "./App.tsx";

function FallBack({ error }: FallbackProps) {
  return <h1>Error: {String(error)}</h1>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={FallBack}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);