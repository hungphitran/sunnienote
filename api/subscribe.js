// Global in-memory storage for subscriptions
global.subscriptions = global.subscriptions || [];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    // Check if it already exists
    const exists = global.subscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      global.subscriptions.push(subscription);
      console.log('New subscription added. Total subscriptions:', global.subscriptions.length);
    }

    return res.status(201).json({ success: true, count: global.subscriptions.length });
  }

  // Get total count for testing
  if (req.method === 'GET') {
    return res.status(200).json({ count: global.subscriptions.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
