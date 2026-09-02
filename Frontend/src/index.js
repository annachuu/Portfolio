import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  createElement(StrictMode, null, createElement(App))
);
