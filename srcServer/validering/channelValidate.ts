import { z } from "zod";
export const channelSchema = z.object({
  name: z.string().min(3, "Channel name must be at least 3 chars."),
  description: z.string().max(200).optional(),
  createdBy: z.string().min(1, "Creator ID required."),
});

export type ChannelInput = z.infer<typeof channelSchema>;