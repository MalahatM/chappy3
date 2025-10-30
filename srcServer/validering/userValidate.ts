import { z } from "zod";
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username too long."),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters.")
    .max(100, "Password too long."),
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;