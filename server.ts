import express from "express";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let db: Db | null = null;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/shiny-dex";

async function connectDB() {
  console.log("Attempting to connect to MongoDB...");
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI environment variable is not set! Using local fallback.");
  }
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db();
    console.log("SUCCESS: Connected to MongoDB");
  } catch (error) {
    console.error("FAILED: MongoDB connection error:", error);
  }
}

// API Routes
app.get("/api/caught/:userId", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not connected" });
  const { userId } = req.params;
  try {
    const userDoc = await db.collection("users").findOne({ userId });
    res.json({ caughtNames: userDoc?.caughtNames || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch caught names" });
  }
});

app.post("/api/caught/:userId", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not connected" });
  const { userId } = req.params;
  const { pokemonName } = req.body;

  console.log(`[DB] Toggling caught status for user ${userId}: ${pokemonName}`);

  try {
    const userDoc = await db.collection("users").findOne({ userId });
    let caughtNames = userDoc?.caughtNames || [];

    if (caughtNames.includes(pokemonName)) {
      caughtNames = caughtNames.filter((name: string) => name !== pokemonName);
      console.log(`[DB] Removed ${pokemonName} from user ${userId}`);
    } else {
      caughtNames.push(pokemonName);
      console.log(`[DB] Added ${pokemonName} to user ${userId}`);
    }

    await db.collection("users").updateOne(
      { userId },
      { $set: { caughtNames } },
      { upsert: true }
    );

    res.json({ caughtNames });
  } catch (error) {
    console.error("[DB] Failed to update caught status:", error);
    res.status(500).json({ error: "Failed to update caught status" });
  }
});

async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
