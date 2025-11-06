import express from "express";
import cors from "cors";

import users from "./routes/users.js";
import channels from "./routes/channels.js";
import messages from "./routes/messages.js";
import login from "./auth/login.js";
import register from "./auth/register.js";

const app = express();
const PORT = process.env.PORT || 10000;

//  Middlewares
app.use(cors());
app.use(express.json());

//  Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//  Routes
app.use("/api/users", users);
app.use("/api/channels", channels);
app.use("/api/messages", messages);
app.use("/api/auth/login", login);
app.use("/api/auth/register", register);

//  Server start
console.log(" Server starting...");
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
