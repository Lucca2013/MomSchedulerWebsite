import jwt from "jsonwebtoken";
import { config } from "dotenv";

config()

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
}

export default function verifyToken(token){
  return jwt.verify(token, process.env.JWT_SECRET);
}
