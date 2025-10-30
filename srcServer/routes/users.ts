import express from "express";
import { db } from "../data/db.js";
import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    console.log("🔍 Fetching user profiles...");
// Scan the table for user profiles
    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression: "begins_with(pk, :userPrefix) AND begins_with(sk, :profilePrefix)",
      ExpressionAttributeValues: {
        ":userPrefix": "USER#",
        ":profilePrefix": "PROFILE#",
      },
    });

    const result = await db.send(command);
// Map the results to a more readable format
    const users = result.Items?.map((u) => ({
      username: u.username,
      email: u.email,
    }));

    res.json(users);
  } catch (error) {
    console.error(" Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete a user by username
router.delete("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const command = new DeleteCommand({
      TableName: "chappy",
      Key: {
        pk: `USER#${username}`,
        sk:` PROFILE#${username}`,
      },
    });

    await db.send(command);
    console.log(`User deleted: ${username}`);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(" Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;