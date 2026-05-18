import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WorkspaceProvider } from "./workspace-loader";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WorkspaceProvider workspaceId="clientA">
      <App />
    </WorkspaceProvider>
  </React.StrictMode>
);
