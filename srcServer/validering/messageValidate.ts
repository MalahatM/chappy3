import { z } from "zod";

// ✅ Schema for sending a message in a channel
export const messageSchema = z.object({
  sender: z.string().min(1, "Sender is required."),
  content: z
    .string()
    .min(1, "Message content cannot be empty.")
    .max(500, "Message is too long."),
});

// ✅ Schema for sending a direct message (DM)
export const dmSchema = z.object({
  sender: z.string().min(1, "Sender is required."),
  receiver: z.string().min(1, "Receiver is required."),
  content: z
    .string()
    .min(1, "Message content cannot be empty.")
    .max(500, "Message is too long."),
});