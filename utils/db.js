import { MongoClient } from "mongodb";

const connectionString = "mongodb://localhost:27017";
export const client = new MongoClient(connectionString);
const dbName = "practice-mongo";
export const db = client.db(dbName);
