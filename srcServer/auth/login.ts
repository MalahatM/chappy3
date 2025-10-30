import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../data/db.js";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

//  POST /api/auth/login
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const command = new GetCommand({
      TableName: "chappy",
      Key: {
        pk: `USER#${username}`,
        sk: `PROFILE#${username}`,
      },
    });

    const result = await db.send(command);
    const user = result.Item;

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Create token
    const token = jwt.sign(
      { username: user.username,},
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log(` User logged in: ${username}`);

    res.json({
      message: "Login successful.",
      token,
      user: { username: user.username, },
    });
  } catch (error) {
    console.error(" Error logging in:", error);
    res.status(500).json({ error: "Login failed due to a server error." });
  }
});

export default router;