   import { exec } from 'child_process';
   import { promisify } from 'util';
   import fs from 'fs';
   import path from 'path';

   const execAsync = promisify(exec);

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
       
       // Create temporary directory
       const tempDir = '/tmp/tiktok-audio';
       if (!fs.existsSync(tempDir)) {
         fs.mkdirSync(tempDir, { recursive: true });
       }
       
       // Generate unique filename
       const timestamp = Date.now();
       const outputPath = path.join(tempDir, `audio_${timestamp}.mp3`);
       
       // yt-dlp command
       const command = `yt-dlp --extract-audio --audio-format mp3 --audio-quality 0 --output "${outputPath}" --no-playlist "${url}"`;
       
       console.log('Executing:', command);
       
       // Execute yt-dlp
       const { stdout, stderr } = await execAsync(command);
       
       if (stderr && !stderr.includes('warning')) {
         console.error('yt-dlp error:', stderr);
         return res.status(500).json({ error: 'Audio extraction failed' });
       }
       
       // Check if file was created
       if (!fs.existsSync(outputPath)) {
         return res.status(500).json({ error: 'Audio file not found' });
       }
       
       // Get file info
       const stats = fs.statSync(outputPath);
       const fileBuffer = fs.readFileSync(outputPath);
       
       // Clean up file
       fs.unlinkSync(outputPath);
       
       // Return audio data
       res.setHeader('Content-Type', 'audio/mpeg');
       res.setHeader('Content-Length', stats.size);
       res.setHeader('Content-Disposition', `attachment; filename="tiktok_audio_${timestamp}.mp3"`);
       
       res.status(200).send(fileBuffer);
       
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ 
         error: 'Internal server error',
         details: error.message 
       });
     }
   }
