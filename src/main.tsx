import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Disable right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Disable copy/cut keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 's')) {
    e.preventDefault();
  }
});

// Disable drag
document.addEventListener('dragstart', (e) => e.preventDefault());

createRoot(document.getElementById("root")!).render(<App />);
