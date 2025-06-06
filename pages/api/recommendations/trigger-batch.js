// pages/api/recommendations/trigger-batch.js
// API to manually trigger batch recommendation generation
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://127.0.0.1:5000';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optional: Add authentication/authorization here
    const { authorization } = req.headers;
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (adminKey && authorization !== `Bearer ${adminKey}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Trigger batch generation on recommendation service
    const response = await fetch(
      `${RECOMMENDATION_SERVICE_URL}/batch/generate-all`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout for batch job
      }
    );

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        success: true,
        message: 'Batch recommendation generation triggered successfully',
        jobDetails: data
      });
    }

    const errorText = await response.text();
    throw new Error(`Recommendation service returned ${response.status}: ${errorText}`);

  } catch (error) {
    console.error('Error triggering batch recommendations:', error);
    
    // Check if it's a timeout or connection error
    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Recommendation service is unavailable',
        message: 'Please try again later'
      });
    }

    return res.status(500).json({ 
      error: 'Failed to trigger batch generation',
      message: error.message 
    });
  }
}