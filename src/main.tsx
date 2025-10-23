import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import '@openai/chatkit-react/styles.css';

createRoot(document.getElementById("root")!).render(<App />);
