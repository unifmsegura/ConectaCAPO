// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CampaignsProvider } from "./data/campaigns";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <CampaignsProvider>
            <App />
        </CampaignsProvider>
    </React.StrictMode>
);