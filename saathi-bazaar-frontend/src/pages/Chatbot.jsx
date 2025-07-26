// saathi-bazaar-frontend/src/pages/Chatbot.jsx
// Basic functional page for the AI Chatbot Assistant.
// This UI is simplified for backend testing. Your frontend team will enhance its design.

import React, { useState, useRef, useEffect } from 'react'; // React hooks and useRef for DOM manipulation
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component

function Chatbot() {
  const [messages, setMessages] = useState([]); // State to store chat messages (objects with sender and text)
  const [input, setInput] = useState(''); // State to hold the current input field value
  const [loading, setLoading] = useState(false); // State to indicate if AI is thinking/loading a response
  const messagesEndRef = useRef(null); // Ref to an empty div at the bottom of messages for auto-scrolling

  // Auto-scroll to the bottom of the chat window whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Smooth scroll effect
  };

  // useEffect hook to call scrollToBottom whenever the 'messages' state array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handles sending a message to the AI backend
  const handleSendMessage = async () => {
    if (input.trim() === '') return; // Don't send empty messages

    const userMessage = { sender: 'user', text: input }; // Create user message object
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user's message to chat history
    setInput(''); // Clear the input field
    setLoading(true); // Set loading state to true (AI is thinking)

    try {
      // API call to your backend's AI chat endpoint
      const res = await api.post('/chat/ask', { prompt: userMessage.text });
      const botMessage = { sender: 'bot', text: res.data.answer }; // Get AI's response
      setMessages((prevMessages) => [...prevMessages, botMessage]); // Add AI's response to chat history
    } catch (error) {
      console.error('Error sending message to AI:', error.response?.data || error.message);
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Sorry, I am having trouble connecting to my brain. Please try again later.' }]); // Display error message
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}> {/* Basic container styling */}
      <Header /> {/* Includes your Header component */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px', flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}> {/* Main content area */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#ea580c' }}>Saathi AI Assistant</h1>

        {/* Chat window: Displays messages */}
        <div style={{ flexGrow: 1, backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', maxHeight: '60vh' }}>
          {/* Messages are displayed in reverse order so new messages appear at bottom when using flex-direction: column-reverse */}
          {messages.slice().reverse().map((msg, index) => (
            <div key={index} style={{ marginBottom: '8px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              <span style={{ display: 'inline-block', padding: '8px 12px', borderRadius: '8px',
                background: msg.sender === 'user' ? '#3b82f6' : '#e5e7eb', color: msg.sender === 'user' ? 'white' : '#1f2937'
              }}>
                {msg.text}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Empty div for auto-scrolling */}
          {loading && <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>Saathi is typing...</div>}
        </div>

        {/* Input area: For typing and sending messages */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} // Send message on Enter key press
            placeholder="Ask Saathi anything about your sourcing..."
            style={{ flexGrow: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '8px', marginRight: '8px' }}
            disabled={loading} // Disable input while AI is loading
          />
          <button
            onClick={handleSendMessage}
            style={{ background: '#3b82f6', color: 'white', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            disabled={loading} // Disable button while AI is loading
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;