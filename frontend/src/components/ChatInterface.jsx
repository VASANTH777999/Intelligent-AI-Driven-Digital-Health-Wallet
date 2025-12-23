import { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import { aiAPI } from '../services/api';
import './ChatInterface.css';

const ChatInterface = ({ reportId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await aiAPI.chat(userMessage, conversationId, reportId);

            if (!conversationId && response.data.conversationId) {
                setConversationId(response.data.conversationId);
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-interface card">
            <div className="chat-header">
                <h3>AI Health Assistant</h3>
                <p>Ask questions about your health report</p>
            </div>

            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-welcome">
                        <p>👋 Hello! I'm your AI health assistant.</p>
                        <p>Ask me anything about your health report, and I'll provide insights and recommendations.</p>
                        <div className="suggested-questions">
                            <p className="suggestions-label">Suggested questions:</p>
                            <button
                                className="suggestion-chip"
                                onClick={() => setInput('What are the key findings in my report?')}
                            >
                                What are the key findings?
                            </button>
                            <button
                                className="suggestion-chip"
                                onClick={() => setInput('What lifestyle changes should I make?')}
                            >
                                What lifestyle changes should I make?
                            </button>
                            <button
                                className="suggestion-chip"
                                onClick={() => setInput('Are there any concerning values?')}
                            >
                                Are there any concerning values?
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${message.role}`}>
                        <div className="message-avatar">
                            {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                            <p>{message.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="chat-message assistant">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content typing">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <textarea
                    className="chat-input"
                    placeholder="Ask a question about your health report..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows="2"
                    disabled={loading}
                />
                <button
                    className="btn btn-primary btn-send"
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                >
                    {loading ? <Loader size={20} className="spinner-icon" /> : <Send size={20} />}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
