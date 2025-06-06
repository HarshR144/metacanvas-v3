const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up multer for temp file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Helper function to convert Buffer to Base64
function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

// API Endpoints
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    console.log(`Generating image with ${model || 'huggingface'} model for prompt: ${prompt}`);

    let imageBuffer;

    // First try Hugging Face
    if (model === 'huggingface' || !model) {
      try {
        imageBuffer = await generateImageWithHuggingFace(prompt);
        console.log('Successfully generated image with Hugging Face');
      } catch (error) {
        console.error('Hugging Face error:', error);
        // If Hugging Face fails, try Gemini as fallback
        if (model === 'huggingface') {
          console.log('Trying Gemini as fallback...');
          try {
            imageBuffer = await generateImageWithGemini(prompt);
            console.log('Successfully generated image with Gemini fallback');
          } catch (geminiError) {
            console.error('Gemini fallback error:', geminiError);
            return res.status(500).json({ message: 'Failed to generate image with both services' });
          }
        } else {
          return res.status(500).json({ message: 'Failed to generate image with Hugging Face' });
        }
      }
    } else if (model === 'gemini') {
      try {
        imageBuffer = await generateImageWithGemini(prompt);
        console.log('Successfully generated image with Gemini');
      } catch (error) {
        console.error('Gemini error:', error);
        return res.status(500).json({ message: 'Failed to generate image with Gemini' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid model specified' });
    }

    // Verify we have a valid buffer
    if (!imageBuffer || imageBuffer.length === 0) {
      console.error('Generated image buffer is empty');
      return res.status(500).json({ message: 'Generated image is empty' });
    }

    // Return the image as base64
    const base64Image = bufferToBase64(imageBuffer);
    console.log(`Image generated successfully, buffer size: ${imageBuffer.length} bytes`);
    
    return res.status(200).json({ 
      imageData: `data:image/png;base64,${base64Image}`,
      success: true
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Helper functions
async function generateImageWithHuggingFace(prompt) {
  try {
    // Using the correct Hugging Face Inference API endpoint
    // You can replace this with other models like:
    // - "stabilityai/stable-diffusion-2-1"
    // - "runwayml/stable-diffusion-v1-5"
    // - "black-forest-labs/FLUX.1-dev" (if available)
    const model = "black-forest-labs/FLUX.1-schnell"; // This is a faster version
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 4, // Faster generation for schnell model
            guidance_scale: 0.0,    // Recommended for schnell model
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error response:', errorText);
      
      // Check if model is loading
      if (response.status === 503) {
        throw new Error('Model is currently loading. Please try again in a few moments.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // The Inference API returns the image directly as a blob
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Verify we received valid image data
    if (buffer.length === 0) {
      throw new Error('Received empty image data from Hugging Face');
    }
    
    return buffer;
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
}

async function generateImageWithGemini(prompt) {
    try{
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
        });
        
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };

        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                      {text: "You are an AI that generates images from text prompts. Create high-quality, artistic images suitable for NFTs."},
                    ],
                },
                {
                    role: "model",
                    parts: [
                      {text: "I understand. I'll generate high-quality, artistic images from your text prompts that would be suitable for NFTs. Please provide your prompt and I'll create an image for you."},
                    ],
                },
            ],
        });
        
        const result = await chatSession.sendMessage(prompt);
        const response = result.response;
        const imagePart = response.candidates[0].content.parts.find(part => part.fileData);

        if (!imagePart || !imagePart.fileData) {
            throw new Error('No image generated in response');
        }
        
        // Extract the base64 image data from the response
        const base64Image = imagePart.fileData.data;
        return Buffer.from(base64Image, 'base64');
    } catch (error) {
        console.error('Error in generateImageWithGemini:', error);
        throw error;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});