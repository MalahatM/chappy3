import express from "express";
import { db } from "../data/db.js";
import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const router = express.Router();

// GET /api/users
router.get("/", async (req, res) => {
  try {
    console.log("Fetching user profiles...");
// Scan DynamoDB for user profiles
    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression:
        "begins_with(pk, :userPrefix) AND begins_with(sk, :profilePrefix)",
      ExpressionAttributeValues: {
        ":userPrefix": "USER#",
        ":profilePrefix": "PROFILE#",
      },
    });

    const result = await db.send(command);

    const users =
      result.Items?.map((u) => ({
        username: u.username,
      })) || [];

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE /api/users/:username
router.delete("/:username", async (req, res) => {
  try {
    const { username } = req.params;
// Delete user profile from DynamoDB
    const command = new DeleteCommand({
      TableName: "chappy",
      Key: {
        pk: `USER#${username}`,
        sk: `PROFILE#${username}`, 
      },
    });
// Send delete command to DynamoDB
    await db.send(command);
    console.log(`User deleted: ${username}`);
// Respond with success message
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
