import { MongoClient } from "mongodb";
import { env } from "./env.js";

const globalForMongo = globalThis;

const client =
  globalForMongo.__mongoClient ?? new MongoClient(env.MONGODB_URI, { maxPoolSize: 10 });

if (!globalForMongo.__mongoClient) {
  globalForMongo.__mongoClient = client;
}

let connected = false;

export async function getDb() {
  if (!connected) {
    await client.connect();
    connected = true;
  }

  const db = client.db(env.MONGODB_DB);
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection("users").createIndex({ discordId: 1 }, { unique: true }),
    db.collection("users").createIndex({ robloxUserId: 1 }, { unique: true }),
    db.collection("users").createIndex({ robloxUsernameLower: 1 }),
    db.collection("roleMappings").createIndex({ guildId: 1, discordRoleId: 1 }, { unique: true }),
    db.collection("roleMappings").createIndex({ guildId: 1, enabled: 1, priority: -1 }),
    db.collection("verificationSessions").createIndex({ state: 1 }, { unique: true }),
    db.collection("verificationSessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ]);
}

