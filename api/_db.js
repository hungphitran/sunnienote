const { Client } = require('pg');

let isInitialized = false;

async function getDbClient() {
  if (!process.env.DATABASE_URL) {
    return null; // Fallback to in-memory if no DATABASE_URL is configured
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for hosted databases (Scaleway, Supabase, Neon)
    }
  });

  await client.connect();

  // Create table if it doesn't exist
  if (!isInitialized) {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS web_push_subscriptions (
          id SERIAL PRIMARY KEY,
          endpoint TEXT UNIQUE NOT NULL,
          keys_p256dh TEXT NOT NULL,
          keys_auth TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      isInitialized = true;
      console.log('PostgreSQL table web_push_subscriptions initialized.');
    } catch (err) {
      console.error('Error creating PostgreSQL table:', err);
    }
  }

  return client;
}

module.exports = {
  getDbClient
};
