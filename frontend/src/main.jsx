import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import RequestPage from "./RequestPage.jsx";
import "./index.css";

const isPublicRequestPage = window.location.pathname.replace(/\/+$/, "") === "/solicitar";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{isPublicRequestPage ? <RequestPage /> : <App />}</React.StrictMode>
);
