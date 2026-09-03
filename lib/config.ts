import dotenv from "dotenv";
import path from "path";

// Architect expects ANTHROPIC_API_KEY in the .env file at the
// root of this installation. If you use a different .env location,
// update the path below accordingly.

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not configured.");
}
