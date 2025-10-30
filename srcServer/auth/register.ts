import express from "express";
import bcrypt from "bcrypt";
import { db } from "../data/db.js";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const router = express.Router();

// POST /api/auth/register
router.post("/", async (req, res) => {
  const { username, password } = req.body;
// Validate input
  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if user already exists
    const checkCommand = new GetCommand({
      TableName: "chappy",
      Key: {
        pk: `USER#${username}`,
        sk: `PROFILE#${username}`,
      },
    });
	
    const existing = await db.send(checkCommand);
    if (existing.Item) {
      return res.status(400).json({ error: "Username already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      pk:`USER#${username}`,
      sk:`PROFILE#${username}`,
      username,
      password: hashedPassword,
    };
// Save to DynamoDB
    const command = new PutCommand({
      TableName: "chappy",
      Item: newUser,
    });

    await db.send(command);
    console.log("User registered:", username);
// Respond with success
    res.status(201).json({
      message: "User registered successfully.",
      user: { username },
    });
  } catch (error) {
    console.error(" Error registering user:", error);
    res.status(500).json({ error: "Registration failed due to a server error." });
  }
});

export default router;