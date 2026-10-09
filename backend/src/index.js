import express from "express";
import cors from "cors";
import "./db.js";
import { router } from "./routes.js";
import { syncJotformRequests } from "./jotform.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
  if (process.env.JOTFORM_API_KEY && process.env.JOTFORM_FORM_ID) {
    syncJotformRequests().catch((err) => console.error("Error sincronizando JotForm:", err.message));
    setInterval(() => {
      syncJotformRequests().catch((err) => console.error("Error sincronizando JotForm:", err.message));
    }, 60_000);
  }
});
