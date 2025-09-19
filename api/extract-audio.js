export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate TikTok URL
    if (!url.includes('tiktok.com')) {
      return res.status(400).json({ error: 'Invalid TikTok URL' });
    }
    
    // For now, return a mock response to test the connection
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    // Return a simple success response
    res.status(200).json({ 
      message: 'API connection successful',
      url: url,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
