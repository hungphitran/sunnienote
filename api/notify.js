const webpush = require('web-push');

// Global in-memory storage for subscriptions
global.subscriptions = global.subscriptions || [];

// Fallback VAPID keys (For instant local testing/demo).
// You should override these via environment variables in production!
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

  console.log(`Sending notification to ${global.subscriptions.length} subscribers...`);

  const notifications = global.subscriptions.map((subscription) => {
    return webpush.sendNotification(subscription, payload)
      .catch((error) => {
        console.error('Error sending push notification:', error);
        // Remove dead subscriptions if they are no longer valid (e.g. status code 410 or 404)
        if (error.statusCode === 410 || error.statusCode === 404) {
          global.subscriptions = global.subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
        }
      });
  });

  await Promise.all(notifications);

  return res.status(200).json({ success: true, sentCount: notifications.length });
};
