import session from "express-session";
import connectPg from "connect-pg-simple";
import pool from "../db/pool.js";
import { config } from "dotenv";

config();
const PgSession = connectPg(session);

export default session({
  store: new PgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400000, //24 hrs
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
});
