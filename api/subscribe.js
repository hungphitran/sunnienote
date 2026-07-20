const { getDbClient } = require('./_db');

// Global in-memory fallback storage for subscriptions
global.subscriptions = global.subscriptions || [];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle subscribe request
  if (req.method === 'POST') {
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    const client = await getDbClient();

    if (client) {
      // PostgreSQL mode
      try {
        const keys_p256dh = subscription.keys?.p256dh || '';
        const keys_auth = subscription.keys?.auth || '';
        
        // Insert or ignore if duplicate endpoint
        await client.query(`
          INSERT INTO web_push_subscriptions (endpoint, keys_p256dh, keys_auth)
          VALUES ($1, $2, $3)
          ON CONFLICT (endpoint) DO UPDATE 
          SET keys_p256dh = EXCLUDED.keys_p256dh, keys_auth = EXCLUDED.keys_auth
        `, [subscription.endpoint, keys_p256dh, keys_auth]);
        
        const countRes = await client.query('SELECT COUNT(*) FROM web_push_subscriptions');
        const count = parseInt(countRes.rows[0].count, 10);
        
        await client.end();
        console.log('Subscription saved to PostgreSQL. Total:', count);
        return res.status(201).json({ success: true, count, storage: 'postgresql' });
      } catch (err) {
        console.error('PostgreSQL subscription save error:', err);
        // Fallback to in-memory on error
        try { await client.end(); } catch (e) {}
      }
    }

    // Fallback: In-memory mode
    const exists = global.subscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      global.subscriptions.push(subscription);
      console.log('Subscription saved to Memory (Fallback). Total:', global.subscriptions.length);
    }
    return res.status(201).json({ success: true, count: global.subscriptions.length, storage: 'memory' });
  }

  // Get total count for testing
  if (req.method === 'GET') {
    const client = await getDbClient();
    if (client) {
      try {
        const countRes = await client.query('SELECT COUNT(*) FROM web_push_subscriptions');
        const count = parseInt(countRes.rows[0].count, 10);
        await client.end();
        return res.status(200).json({ count, storage: 'postgresql' });
      } catch (err) {
        console.error('PostgreSQL count query error:', err);
        try { await client.end(); } catch (e) {}
      }
    }
    return res.status(200).json({ count: global.subscriptions.length, storage: 'memory' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
