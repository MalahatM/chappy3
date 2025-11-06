import express from "express";
import { db } from "../data/db.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { AuthRequest } from "../auth/authMiddleware.js";

const router = express.Router();

//  GET /api/channels
router.get("/", async (req: AuthRequest, res) => {
  try {
    console.log("GET /api/channels called");

    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression:
        "begins_with(pk, :channelPrefix) AND begins_with(sk, :metaPrefix)",
      ExpressionAttributeValues: {
        ":channelPrefix": "CHANNEL#",
        ":metaPrefix": "META#",
      },
    });

    const result = await db.send(command);
    const channels = result.Items || [];

    // showing guest users only public channels
    const filtered = req.isGuest
      ? channels.filter((ch) => !ch.isPrivate)
      : channels;

    res.json(filtered);
  } catch (error) {
    console.error(" Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels." });
  }
});

export default router;
