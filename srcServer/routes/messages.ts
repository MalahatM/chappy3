import express from "express";
import { db } from "../data/db.js";
import { QueryCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { messageSchema, dmSchema } from "../validering/messageValidate.js";
import type { AuthRequest } from "../auth/authMiddleware.js";

const router = express.Router();


   // GET /api/messages/dm/:username
   // Fetch all direct messages that involve a given user
   //(Only accessible by logged-in users)

router.get("/dm/:username", async (req: AuthRequest, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: "Guests cannot access DMs." });
  }

  try {
    const { username } = req.params;

    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression: "begins_with(pk, :dmPrefix) AND (sender = :u OR receiver = :u)",
      ExpressionAttributeValues: {
        ":dmPrefix": "DM#",
        ":u": username,
      },
    });

    const result = await db.send(command);

    // Sort messages by most recent first
    const items =
      (result.Items || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    res.json(items);
  } catch (error) {
    console.error(" Error fetching DMs:", error);
    res.status(500).json({ error: "Failed to fetch DMs." });
  }
});


   // GET /api/messages/dm/:user1/:user2
   // Fetch all direct messages between two specific users

router.get("/dm/:user1/:user2", async (req: AuthRequest, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: "Guests cannot access DMs." });
  }

  try {
    const user1 = req.params.user1 as string;
    const user2 = req.params.user2 as string;

    const dmKey =
      user1.toLowerCase() < user2.toLowerCase()
        ? `DM#${user1}#${user2}`
        : `DM#${user2}#${user1}`;


    const command = new QueryCommand({
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :msgPrefix)",
      ExpressionAttributeValues: {
        ":pk": dmKey,
        ":msgPrefix": "MESSAGE#",
      },
    });

    const result = await db.send(command);

    // Sort messages by oldest first (chat order)
    const items =
      (result.Items || []).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    res.json(items);
  } catch (error) {
    console.error(" Error fetching DMs:", error);
    res.status(500).json({ error: "Failed to fetch direct messages." });
  }
});


   // POST /api/messages/dm/:receiver
   //Send a direct message between two users
   //(Only allowed for logged-in users)

router.post("/dm/:receiver", async (req: AuthRequest, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: "Guests cannot send direct messages." });
  }

  try {
    const receiver = req.params.receiver as string;

    //  Validate body data
    const parsed = dmSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((e) => e.message),
      });
    }

    const { sender, content } = parsed.data;
    const timestamp = new Date().toISOString();

    //  Use shared DM key instead of duplicating items
    const dmKey =
      sender.toLowerCase() < receiver.toLowerCase()
        ? `DM#${sender}#${receiver}`
        : `DM#${receiver}#${sender}`;

    const newMessage = {
      pk: dmKey,
      sk: `MESSAGE#${timestamp}`,
      sender,
      receiver,
      content,
      createdAt: timestamp,
    };

    await db.send(new PutCommand({ TableName: "chappy", Item: newMessage }));

    res.status(201).json({
      message: "DM sent successfully.",
      item: newMessage,
    });
  } catch (error) {
    console.error(" Error sending DM:", error);
    res.status(500).json({ error: "Failed to send DM." });
  }
});

   // GET /api/messages/:channel
   //Fetch messages from a specific channel
   //(Guests are allowed to view)

router.get("/:channel", async (req: AuthRequest, res) => {
  try {
    const channel = req.params.channel as string;

    const command = new QueryCommand({
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :msgPrefix)",
      ExpressionAttributeValues: {
        ":pk": `CHANNEL#${channel}`,
        ":msgPrefix": "MESSAGE#",
      },
    });

    const result = await db.send(command);
    const items =
      (result.Items || []).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    res.json(items);
  } catch (error) {
    console.error(" Error fetching channel messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});


   // POST /api/messages/:channel
   //Send a message to a channel
   //(Guests can only post in public channels)

router.post("/:channel", async (req: AuthRequest, res) => {
  try {
    const channel = req.params.channel as string;

    // Validate input
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((e) => e.message),
      });
    }

    const { sender, content } = parsed.data;
    const timestamp = new Date().toISOString();

    const newMessage = {
      pk: `CHANNEL#${channel}`,
      sk: `MESSAGE#${timestamp}`,
      sender,
      content,
      createdAt: timestamp,
    };

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
