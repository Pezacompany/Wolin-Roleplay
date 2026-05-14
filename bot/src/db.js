import { MongoClient } from "mongodb";
import { config } from "./config.js";

const client = new MongoClient(config.MONGODB_URI);
let database;

export async function getDb() {
  if (!database) {
    await client.connect();
    database = client.db(config.MONGODB_DB);
    await ensureIndexes(database);
  }

  return database;
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

export async function closeDb() {
  await client.close();
  database = undefined;
}

