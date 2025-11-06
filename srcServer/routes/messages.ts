import express from "express";
import { db } from "../data/db.js";
import { QueryCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { messageSchema, dmSchema } from "../validering/messageValidate.js";
import type { AuthRequest } from "../auth/authMiddleware.js";

const router = express.Router();

// Get all direct messages related to one user (only for logged-in users)
router.get("/dm/:username", async (req: AuthRequest, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: "Guests cannot access DMs." });
  }

  try {
    const { username } = req.params;

    // Fetch DMs where the user is sender or receiver
    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression: "sender = :u OR receiver = :u",
      ExpressionAttributeValues: { ":u": username },
    });

    const result = await db.send(command);

    // sort messages by creation date (newest first)
    const items =
      (result.Items || []).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    res.json(items);
  } catch (error) {
    console.error("❌ Error fetching DMs:", error);
    res.status(500).json({ error: "Failed to fetch DMs." });
  }
});

//  get DMs exchanged between two specific users
router.get("/dm/:user1/:user2", async (req: AuthRequest, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: "Guests cannot access DMs." });
  }

  try {
    const { user1, user2 } = req.params;

    // Fetch messages where user1 <-> user2 are sender/receiver pairs
    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression:
        "(sender = :user1 AND receiver = :user2) OR (sender = :user2 AND receiver = :user1)",
      ExpressionAttributeValues: {
        ":user1": user1,
        ":user2": user2,
      },
    });

    const result = await db.send(command);

    // Sort by creation time (oldest first)
    const items = (result.Items || []).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    res.json(items);
  } catch (error) {
    console.error("❌ Error fetching DMs:", error);
    res.status(500).json({ error: "Failed to fetch direct messages." });
  }
});

// Send a direct message between two users (only logged-in users)
router.post("/dm/:receiver", async (req: AuthRequest, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: "Guests cannot send direct messages." });
  }

  try {
    const { receiver } = req.params;

    // Validate input using Zod schema
    const parsed = dmSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((e) => e.message),
      });
    }

    const { sender, content } = parsed.data;
    const timestamp = new Date().toISOString();

    // Create two mirrored records (for sender & receiver)
    const senderItem = {
      pk: `USER#${sender}`,
      sk: `DM#${receiver}#${timestamp}`,
      sender,
      receiver,
      content,
      createdAt: timestamp,
    };

    const receiverItem = {
      pk: `USER#${receiver}`,
      sk: `DM#${sender}#${timestamp}`,
      sender,
      receiver,
      content,
      createdAt: timestamp,
    };

    // Save both messages in DynamoDB
    await Promise.all([
      db.send(new PutCommand({ TableName: "chappy", Item: senderItem })),
      db.send(new PutCommand({ TableName: "chappy", Item: receiverItem })),
    ]);

    res.status(201).json({
      message: "DM sent successfully.",
      item: senderItem,
    });
  } catch (error) {
    console.error(" Error sending DM:", error);
    res.status(500).json({ error: "Failed to send DM." });
  }
});

//  Get all messages from a specific channel (guests allowed)
router.get("/:channel", async (req: AuthRequest, res) => {
  try {
    const channel = req.params.channel as string;

    // Query all messages belonging to the channel
    const command = new QueryCommand({
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :msgPrefix)",
      ExpressionAttributeValues: {
        ":pk": `CHANNEL#${channel}`,
        ":msgPrefix": "MESSAGE#",
      },
    });

    const result = await db.send(command);

    // Sort by oldest first
    const items =
      (result.Items || []).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    res.json(items);
  } catch (error) {
    console.error(" Error fetching channel messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// 🔹 Send a message to a channel (guests can post in open channels only)
router.post("/:channel", async (req: AuthRequest, res) => {
  try {
    const channel = req.params.channel as string;

    // Validate message content
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((e) => e.message),
      });
    }

    const { sender, content } = parsed.data;
    const timestamp = new Date().toISOString();

    // Create new message object
    const newMessage = {
      pk: `CHANNEL#${channel}`,
      sk: `MESSAGE#${timestamp}`,
      sender,
      content,
      createdAt: timestamp,
    };

    // Save message to DynamoDB
    await db.send(new PutCommand({ TableName: "chappy", Item: newMessage }));

    res.status(201).json({
      message: "Message sent successfully.",
      item: newMessage,
    });
  } catch (error) {
    console.error(" Error sending channel message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

export default router;
