import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import ElizabethPop from "./ElizabethPop.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ElizabethPop />
  </StrictMode>
);
