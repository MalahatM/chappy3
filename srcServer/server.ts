// Import core dependencies
import express from "express";
import cors from "cors";
import path from "path";

// Import route modules
import users from "./routes/users.js";
import channels from "./routes/channels.js";
import messages from "./routes/messages.js";
import login from "./auth/login.js";
import register from "./auth/register.js";

const app = express();
const PORT = process.env.PORT || 10000;

//  Enable CORS for cross-origin requests
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

//  Log every incoming request (method + URL)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//  API routes for users, channels, messages, login, and register
app.use("/api/users", users);
app.use("/api/channels", channels);
app.use("/api/messages", messages);
app.use("/api/auth/login", login);
app.use("/api/auth/register", register);

//  Serve frontend (React build) from the "dist" folder
const frontendPath = path.resolve("./dist");
app.use(express.static(frontendPath));

// Start the Express server
console.log("Server starting...");
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
