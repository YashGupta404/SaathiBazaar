const express = require('express');
const axios = require('axios');

const BulkOrder = require('../models/BulkOrder');
const MandiWholesaler = require('../models/MandiWholesaler');
const Product = require('../models/Product');
const User = require('../models/User');

module.exports = (auth) => {
  const router = express.Router();

  const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).send({ error: 'Unauthorized' });
    try {
      await auth.verifyIdToken(idToken);
      next();
    } catch (error) {
      res.status(401).send({ error: 'Invalid token' });
    }
  };

  // ✅ FIXED block
  router.post('/ask', verifyToken, async (req, res) => {
    const { prompt } = req.body;
    let context = "";
    let systemInstructions = `You are Bazaar Guru, an expert, helpful, and concise AI assistant specifically designed for street food vendors in India using the Saathi Bazaar app.

**Your Goal:** Provide accurate and practical advice on:
- How to start a street food stall (legal procedures, licenses, basic needs)
- Raw material sourcing (prices, best practices, quality, finding suppliers)
- Functions and features of the Saathi Bazaar app (P2P surplus, Mandi directory, Bulk Buy, Cart, Profile)
- General business tips for street vendors (hygiene, customer service, pricing strategy)
- Current market trends or simple weather impacts (if data is provided).

**Instructions:**
1.  **Prioritize provided context:** If "Current Saathi Bazaar Data (Context)" is given, use it specifically to answer questions about items, orders, or shops within the app.
2.  **Act as an expert:** Provide helpful, actionable advice.
3.  **Concise and Clear:** Keep answers brief and easy to understand for vendors.
4.  **Language:** If the vendor asks in Hindi or Bengali, try to respond in that language. Otherwise, respond in clear English.
5.  **Limitations:** If the provided context doesn't contain enough information for a specific factual question (e.g., specific market rates outside your data, very precise legal advice for a specific city, or real-time weather not provided), state that your knowledge is based on the system's current data or general information, and suggest contacting a local authority or checking a dedicated app for real-time information.
`;

    try {
      const lowerCasePrompt = prompt.toLowerCase();

      // Bulk Orders Context
      if (lowerCasePrompt.includes('bulk') || lowerCasePrompt.includes('group order') || lowerCasePrompt.includes('discount')) {
        const bulkOrders = await BulkOrder.find({ status: 'open' }).limit(3);
        context += "\n\n--- Current Saathi Bazaar Bulk Orders ---\n";
        if (bulkOrders.length > 0) {
          bulkOrders.forEach(offer => {
            context += `- Item: ${offer.itemName}, Cluster: ${offer.clusterLocation}, Current: ${offer.current_qty}/${offer.target_qty} ${offer.unit}, Bulk Price: Rs ${offer.bulkPrice}/${offer.unit}, Deadline: ${new Date(offer.deadline).toLocaleDateString()}\n`;
          });
        } else {
          context += "No active bulk orders currently available in the system.\n";
        }
        context += "-------------------------------------------\n\n";
      }

      // Mandi Shops Context
      if (lowerCasePrompt.includes('mandi') || lowerCasePrompt.includes('shop') || lowerCasePrompt.includes('supplier')) {
        const mandis = await MandiWholesaler.find().limit(2);
        context += "\n\n--- Saathi Bazaar Mandi Shops (Directory) ---\n";
        if (mandis.length > 0) {
          mandis.forEach(mandi => {
            context += `- Shop: ${mandi.shopName}, Contact: ${mandi.contact}, Description: ${mandi.description}\n`;
            if (mandi.products_offered?.length > 0) {
              context += `  - Top Products: ${mandi.products_offered.slice(0, 2).map(p => p.name).join(', ')}\n`;
            }
          });
        } else {
          context += "No mandi shops currently listed in the system.\n";
        }
        context += "-----------------------------------------------\n\n";
      }

      // Surplus Items
      if (lowerCasePrompt.includes('surplus') || lowerCasePrompt.includes('extra items') || lowerCasePrompt.includes('other vendors')) {
        const surplusItems = await Product.find({ type: 'surplus', status: 'available' }).limit(2);
        context += "\n\n--- Saathi Bazaar Surplus Items (P2P) ---\n";
        if (surplusItems.length > 0) {
          surplusItems.forEach(item => {
            context += `- Item: ${item.name}, Qty: ${item.quantity} ${item.unit}, Price: Rs ${item.price}, Listed by: ${item.listedByShop || item.listedByName}\n`;
          });
        } else {
          context += "No surplus items currently listed by other vendors.\n";
        }
        context += "------------------------------------------\n\n";
      }

      // App Function Context
      if (lowerCasePrompt.includes('app function') || lowerCasePrompt.includes('how to use') || lowerCasePrompt.includes('what can you do')) {
        context += "\n\n--- Saathi Bazaar App Functions ---\n";
        context += "1. Vendor-to-Vendor Surplus Exchange\n";
        context += "2. Mandi Shop Directory\n";
        context += "3. Bulk Buy Scheme\n";
        context += "4. AI Chatbot (Bazaar Guru)\n";
        context += "------------------------------------\n\n";
      }

    } catch (dbError) {
      console.error('Error fetching context from MongoDB:', dbError.message);
      context += "\n\n--- Note: Could not retrieve real-time app data due to a database issue. ---\n\n";
    }

    const fullPrompt = `${systemInstructions}\n\nVendor's Question: "${prompt}"\n\n${context}Answer: `;

    console.log('DEBUG: Full prompt sent to OpenRouter AI:', fullPrompt);

    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: systemInstructions
          },
          {
            role: 'user', 
            content: `${prompt}\n\nContext: ${context}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Saathi Bazaar'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      console.log('DEBUG: OpenRouter AI raw response:', aiResponse);
      res.status(200).send({ answer: aiResponse });
    } catch (aiError) {
      console.error('Error with AI chat (OpenRouter API):', aiError.response?.data || aiError.message);
      res.status(500).send({ error: 'Failed to get response from Bazaar Guru. Please try again later.' });
    }
  }); // ✅ <--- This closes the router.post function properly

  return router;
};
