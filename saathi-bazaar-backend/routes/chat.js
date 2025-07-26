// saathi-bazaar-backend/routes/chat.js
const express = require('express'); // Imports Express to create routes
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Google's AI library for Gemini

// Import MongoDB models to fetch real-time context for the AI
const BulkOrder = require('../models/BulkOrder'); // For bulk order context
const MandiWholesaler = require('../models/MandiWholesaler'); // For mandi shop context

// Access your Gemini API Key from your .env file and initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Uses API key from .env
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Specifies which Gemini model to use

module.exports = (auth) => { // 'auth' object from Firebase Admin SDK (passed from server.js)
  const router = express.Router(); // Creates an Express Router

  // Middleware (optional, if you want chat to require login)
  const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).send({ error: 'Unauthorized' });
    try {
      await auth.verifyIdToken(idToken); // Verifies the user's login token
      next();
    } catch (error) {
      res.status(401).send({ error: 'Invalid token' });
    }
  };

  // POST /api/chat/ask: Endpoint for asking the AI assistant a question
  router.post('/ask', verifyToken, async (req, res) => { // Add verifyToken if you want chat to be authenticated
    const { prompt } = req.body; // The user's question (prompt) from the frontend
    try {
      let context = ""; // This variable will dynamically hold relevant data from your app's database to give context to the AI

      // --- CONTEXTUAL AI LOGIC (CRITICAL FOR HACKATHON DEMO) ---
      // This part analyzes the user's question (prompt) and fetches relevant data from MongoDB
      // to provide to the AI as context. This makes the AI's answers more specific and useful.

      // Example 1: If the prompt asks about 'tomatoes' and 'bulk offers'
      if (prompt.toLowerCase().includes('tomato') && prompt.toLowerCase().includes('bulk')) {
        const bulkTomatoes = await BulkOrder.find({ itemName: 'Tomato', status: 'open' }).limit(1); // Find one open bulk order for tomatoes
        if (bulkTomatoes.length > 0) {
          const offer = bulkTomatoes[0];
          context += "\n\n--- Current Saathi Bazaar Data (Context) ---\n";
          context += `Open Bulk Order for Tomatoes in ${offer.clusterLocation}:\n`;
          context += `- Current Quantity: ${offer.current_qty} ${offer.unit}\n`;
          context += `- Target Quantity: ${offer.target_qty} ${offer.unit}\n`;
          context += `- Bulk Price: Rs ${offer.bulkPrice} per ${offer.unit} (Individual: Rs ${offer.individualPrice})\n`;
          context += `- Deadline: ${new Date(offer.deadline).toLocaleString()}\n`;
          context += "-------------------------------------------\n\n";
        }
      }
      // Example 2: If the prompt asks about a "shop in Sealdah"
      if (prompt.toLowerCase().includes('sealdah') && prompt.toLowerCase().includes('shop')) {
          const sealdahMandi = await MandiWholesaler.findOne({ shopName: /sealdah/i }); // Search for a mandi shop with "sealdah" in its name (case-insensitive)
          if (sealdahMandi) {
              context += "\n\n--- Current Saathi Bazaar Data (Context) ---\n";
              context += `Found Mandi Shop: ${sealdahMandi.shopName} (Contact: ${sealdahMandi.contact})\n`;
              context += `Products: ${sealdahMandi.products_offered.map(p => p.name).join(', ')}\n`;
              context += "-------------------------------------------\n\n";
          }
      }
      // You can add more conditions here for other items or types of queries you want the AI to respond to intelligently
      // (e.g., specific surplus items, general hygiene advice, etc.).

      // This is the full instruction (prompt) that will be sent to the Google Gemini AI model.
      // It includes system instructions and the user's question, plus any relevant context from your database.
      const fullPrompt = `You are Saathi AI Assistant, a helpful, friendly, and concise assistant for street food vendors in India. Your primary goal is to help them with their raw material sourcing questions, using the provided context if available. If a question is in Hindi or Bengali, try to respond in that language. Otherwise, respond in English. If context is provided below, use it to give specific answers. If the context doesn't have the answer to a factual question, state that you can only provide information from the system's data and suggest contacting suppliers directly or using general knowledge.

      Vendor's Question: "${prompt}"

      ${context}

      Answer: `;

      const result = await model.generateContent(fullPrompt); // Sends the comprehensive prompt to Gemini AI
      const response = await result.response;
      const text = response.text(); // Gets the AI's generated textual response

      res.status(200).send({ answer: text }); // Sends the AI's answer back to the frontend
    } catch (error) {
      console.error('Error with AI chat:', error.message);
      res.status(500).send({ error: 'Failed to get response from AI.' });
    }
  });

  return router; // Return the configured router to be used in server.js
};