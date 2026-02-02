import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./ErrorBoundary";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
