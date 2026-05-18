import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { WorkspaceProvider } from "./workspace-loader";
import { PackProvider } from "./pack-loader";
import { MetadataProvider } from "./metadata";

const WORKSPACE_ID = "clientA";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WorkspaceProvider workspaceId={WORKSPACE_ID}>
      <PackProvider workspaceId={WORKSPACE_ID}>
        <MetadataProvider>
          <App />
        </MetadataProvider>
      </PackProvider>
    </WorkspaceProvider>
  </React.StrictMode>
);
