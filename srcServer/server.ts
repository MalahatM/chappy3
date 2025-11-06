import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Import all route modules
import users from "./routes/users.js";
import channels from "./routes/channels.js";
import messages from "./routes/messages.js";
import login from "./auth/login.js";
import register from "./auth/register.js";

// ✅ Express setup
const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Resolve __dirname correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ✅ Optional request logger (you can remove if not needed)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ API routes
app.use("/api/users", users);
app.use("/api/channels", channels);
app.use("/api/messages", messages);
app.use("/api/auth/login", login);
app.use("/api/auth/register", register);

// ✅ Serve frontend (for production builds)
const frontendPath = path.resolve(__dirname, "../dist");
app.use(express.static(frontendPath));

// ✅ Catch-all route (non-API) → send index.html
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
