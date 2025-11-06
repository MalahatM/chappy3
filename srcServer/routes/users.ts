import express from "express";
import { db } from "../data/db.js";
import { ScanCommand} from "@aws-sdk/lib-dynamodb";
import type { AuthRequest } from "../auth/authMiddleware.js";

const router = express.Router();

//  GET /api/users 
router.get("/", async (req: AuthRequest, res) => {
  try {
    console.log("Fetching user profiles...");

 // Create a Scan command to look for all user profiles in DynamoDB
    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression:
        "begins_with(pk, :userPrefix) AND begins_with(sk, :profilePrefix)",
      ExpressionAttributeValues: {
        ":userPrefix": "USER#",
        ":profilePrefix": "PROFILE#",
      },
    });
 // Send the command to DynamoDB
    const result = await db.send(command);
	 // Extract usernames from the results
    const users =
      result.Items?.map((u) => ({
        username: u.username,
      })) || [];

    // Send the list of users to the frontend
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});



export default router;
