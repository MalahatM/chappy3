import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Custom request type to include `user` and `isGuest`
export interface AuthRequest extends Request {
  user?: JwtPayload | null;
  isGuest?: boolean;
}

// Middleware to verify JWT token or mark user as guest
export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // If no token is provided → treat as guest user
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    req.isGuest = true;
    return next();
  }

  // Extract token safely (fallback to empty string if undefined)
  const token = authHeader.split(" ")[1] ?? "";

  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token as string, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    req.isGuest = false;
    return next();
  } catch (error) {
    // If token is invalid, mark as guest but continue
    console.warn("⚠️ Invalid token:", error);
    req.user = null;
    req.isGuest = true;
    return next();
  }
}

export default verifyToken;
