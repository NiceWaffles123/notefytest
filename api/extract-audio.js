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
    
    // Use cobalt.tools API for TikTok audio extraction
    const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        vQuality: 'best',
        aFormat: 'mp3',
        isAudioOnly: true
      })
    });
    
    if (!cobaltResponse.ok) {
      throw new Error(`Cobalt API error: ${cobaltResponse.status}`);
    }
    
    const cobaltData = await cobaltResponse.json();
    
    if (cobaltData.status === 'success' && cobaltData.url) {
      // Download the audio file
      const audioResponse = await fetch(cobaltData.url);
      if (!audioResponse.ok) {
        throw new Error('Failed to download audio file');
      }
      
      const audioBuffer = await audioResponse.arrayBuffer();
      
      // Return the audio data
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength);
      res.setHeader('Content-Disposition', `attachment; filename="tiktok_audio_${Date.now()}.mp3"`);
      
      res.status(200).send(Buffer.from(audioBuffer));
    } else {
      throw new Error(cobaltData.text || 'Audio extraction failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
