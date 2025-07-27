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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--mint-50), var(--emerald-50))', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease'
    }}>
      <Header />
      <div style={{ 
        maxWidth: '960px', 
        margin: '0 auto', 
        padding: '16px', 
        paddingTop: '80px', 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%' 
      }}>
        {/* Animated Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '24px',
          animation: 'fadeIn 0.6s ease'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: 'var(--mint-700)',
            background: 'linear-gradient(135deg, var(--emerald-600), var(--forest-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🤖 Saathi AI Assistant
          </h1>
          <p style={{ 
            color: 'var(--mint-600)', 
            fontSize: '1.1rem', 
            opacity: '0.9',
            animation: 'fadeIn 0.6s ease 0.2s both'
          }}>
            Your intelligent sourcing companion
          </p>
        </div>

        {/* Enhanced Chat Window */}
        <div style={{ 
          flexGrow: 1, 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          padding: '32px', 
          borderRadius: '20px', 
          border: '2px solid var(--mint-200)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)', 
          marginBottom: '20px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column-reverse', 
          maxHeight: '60vh',
          animation: 'fadeIn 0.6s ease 0.3s both'
        }}>
          {/* Enhanced Messages */}
          {messages.slice().reverse().map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '16px', 
                textAlign: msg.sender === 'user' ? 'right' : 'left',
                animation: `fadeIn 0.3s ease ${index * 0.1}s both`
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
                fontSize: '0.85rem',
                color: 'var(--mint-500)',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.sender === 'user' ? (
                  <>You <span>👤</span></>
                ) : (
                  <><span>🤖</span> Saathi</>
                )}
              </div>
              <div style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: '16px',
                maxWidth: '70%',
                wordBreak: 'break-word',
                background: msg.sender === 'user' 
                  ? 'linear-gradient(135deg, var(--emerald-500), var(--forest-500))' 
                  : 'linear-gradient(135deg, var(--mint-100), var(--emerald-100))',
                color: msg.sender === 'user' ? 'white' : 'var(--mint-700)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                fontSize: '1rem',
                lineHeight: '1.5',
                border: msg.sender === 'bot' ? '1px solid var(--mint-200)' : 'none'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Welcome message when no messages */}
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--mint-600)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: 'var(--mint-700)'
              }}>
                Hello! I'm Saathi AI
              </h3>
              <p style={{ 
                fontSize: '1rem', 
                opacity: '0.8',
                lineHeight: '1.5'
              }}>
                Ask me anything about sourcing, pricing, or finding the best deals!
              </p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          
          {/* Enhanced Loading Indicator */}
          {loading && (
            <div style={{ 
              textAlign: 'left',
              marginBottom: '16px',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
                fontSize: '0.85rem',
                color: 'var(--mint-500)'
              }}>
                <span>🤖</span> Saathi
              </div>
              <div style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--mint-100), var(--emerald-100))',
                border: '1px solid var(--mint-200)',
                color: 'var(--mint-700)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '2px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--mint-400)',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}></div>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--mint-400)',
                      animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                    }}></div>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--mint-400)',
                      animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '0.9rem' }}>Saathi is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          padding: '20px', 
          borderRadius: '16px', 
          border: '2px solid var(--mint-200)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)', 
          display: 'flex', 
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeIn 0.6s ease 0.4s both'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="💬 Ask Saathi anything about sourcing, pricing, or deals..."
            style={{ 
              flexGrow: 1, 
              padding: '14px 18px', 
              border: '2px solid var(--mint-200)', 
              borderRadius: '12px', 
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            disabled={loading}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--emerald-400)';
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 163, 74, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--mint-200)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{ 
              background: loading 
                ? 'var(--mint-300)' 
                : 'linear-gradient(135deg, var(--emerald-500), var(--forest-500))', 
              color: 'white', 
              padding: '14px 20px', 
              borderRadius: '12px', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '100px',
              justifyContent: 'center'
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 163, 74, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Sending
              </>
            ) : (
              <>
                <span>📤</span>
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;