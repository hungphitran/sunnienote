const webpush = require('web-push');
const { getDbClient } = require('./_db');

// Global in-memory fallback storage for subscriptions
global.subscriptions = global.subscriptions || [];

// Fallback VAPID keys
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BIrUiRolvPe5JpsBnlLnhz_tR7wk95zw_axWnsAm7ddVPJD9njR9Uj0sjVdXzKOlwWXN1ge2aj3rliYz6Z44-MQ';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'ADKLyKnCTKQLFiC9NK4iWubtpCnn9wmcz3Z7VJuaMdI';

webpush.setVapidDetails(
  'mailto:sunnie.app@example.com',
  publicVapidKey,
  privateVapidKey
);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, url } = req.body || {};
  const payload = JSON.stringify({
    title: title || 'Nhắc nhở từ Sunnie! 🌸',
    body: body || 'Đã đến lúc kiểm tra lại các công việc của bạn rồi.',
    url: url || '/'
  });

  const client = await getDbClient();
  let subscriptions = [];
  let isPostgres = false;

  if (client) {
    try {
      const resDb = await client.query('SELECT endpoint, keys_p256dh, keys_auth FROM web_push_subscriptions');
      subscriptions = resDb.rows.map(row => ({
        endpoint: row.endpoint,
        keys: {
          p256dh: row.keys_p256dh,
          auth: row.keys_auth
        }
      }));
      isPostgres = true;
    } catch (err) {
      console.error('PostgreSQL get subscriptions error:', err);
    }
  }

  if (!isPostgres) {
    subscriptions = global.subscriptions;
  }

  console.log(`Sending notification to ${subscriptions.length} subscribers (via ${isPostgres ? 'postgresql' : 'memory'})...`);

  const notifications = subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (error) {
      console.error('Error sending push notification:', error);
      
      // Cleanup dead subscriptions (410 Gone or 404 Not Found)
      if (error.statusCode === 410 || error.statusCode === 404) {
        if (isPostgres && client) {
          try {
            await client.query('DELETE FROM web_push_subscriptions WHERE endpoint = $1', [subscription.endpoint]);
            console.log(`Deleted expired subscription from PostgreSQL: ${subscription.endpoint}`);
          } catch (deleteErr) {
            console.error('Error deleting expired subscription from PostgreSQL:', deleteErr);
          }
        } else {
          global.subscriptions = global.subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
          console.log(`Deleted expired subscription from Memory: ${subscription.endpoint}`);
        }
      }
    }
  });

  await Promise.all(notifications);

  if (isPostgres && client) {
    try {
      await client.end();
    } catch (e) {}
  }

  return res.status(200).json({ 
    success: true, 
    sentCount: subscriptions.length,
    storage: isPostgres ? 'postgresql' : 'memory' 
  });
};
