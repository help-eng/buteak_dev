"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ApiResponseView } from "@/components/ApiResponseView";

export default function TestChatbot() {
    const [activeTab, setActiveTab] = useState("chat");
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [latestApiResponse, setLatestApiResponse] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (messageText) => {
        // Add user message
        const userMessage = {
            id: Date.now(),
            text: messageText,
            isUser: true,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Show typing indicator
        setIsTyping(true);

        try {
            // Call chat API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: messageText,
                    n_results: 3,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Store API response
            setLatestApiResponse(data);

            // Add bot message
            const botMessage = {
                id: Date.now() + 1,
                text: data.answer,
                isUser: false,
                timestamp: new Date(),
                apiResponse: data,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);

            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearChat = () => {
        if (confirm("Are you sure you want to clear the chat history?")) {
            setMessages([]);
            setLatestApiResponse(null);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-surface-1 flex flex-col">
            <ThemeToggle />

            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface-2 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/" className="inline-flex items-center text-buteak-primary dark:text-buteak-gold hover:underline mb-3">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-buteak-primary to-buteak-gold bg-clip-text text-transparent">
                        Buteak Suites Chatbot
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Ask me anything about Buteak Suites hotel
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface-2">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`px-6 py-3 font-semibold transition-all ${activeTab === "chat"
                                    ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                                }`}
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => setActiveTab("response")}
                            className={`px-6 py-3 font-semibold transition-all ${activeTab === "response"
                                    ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                                }`}
                        >
                            API Response
                        </button>
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`px-6 py-3 font-semibold transition-all ${activeTab === "info"
                                    ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                                }`}
                        >
                            Info
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === "chat" && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="container mx-auto px-4 py-6 max-w-4xl">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                        <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-buteak-primary to-buteak-gold flex items-center justify-center">
                                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                            Welcome to Buteak Suites Chatbot
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                            Ask me anything about our hotel policies, amenities, services, or general information.
                                        </p>
                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                                            <button
                                                onClick={() => handleSendMessage("Are couples allowed?")}
                                                className="px-4 py-3 bg-white dark:bg-dark-surface-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-buteak-gold dark:hover:border-buteak-gold transition-all text-left"
                                            >
                                                <p className="text-sm text-gray-700 dark:text-gray-300">Are couples allowed?</p>
                                            </button>
                                            <button
                                                onClick={() => handleSendMessage("What are the check-in timings?")}
                                                className="px-4 py-3 bg-white dark:bg-dark-surface-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-buteak-gold dark:hover:border-buteak-gold transition-all text-left"
                                            >
                                                <p className="text-sm text-gray-700 dark:text-gray-300">What are the check-in timings?</p>
                                            </button>
                                            <button
                                                onClick={() => handleSendMessage("Do you have parking?")}
                                                className="px-4 py-3 bg-white dark:bg-dark-surface-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-buteak-gold dark:hover:border-buteak-gold transition-all text-left"
                                            >
                                                <p className="text-sm text-gray-700 dark:text-gray-300">Do you have parking?</p>
                                            </button>
                                            <button
                                                onClick={() => handleSendMessage("What amenities do you offer?")}
                                                className="px-4 py-3 bg-white dark:bg-dark-surface-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-buteak-gold dark:hover:border-buteak-gold transition-all text-left"
                                            >
                                                <p className="text-sm text-gray-700 dark:text-gray-300">What amenities do you offer?</p>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <ChatMessage
                                                key={msg.id}
                                                message={msg.text}
                                                isUser={msg.isUser}
                                                timestamp={msg.timestamp}
                                            />
                                        ))}
                                        {isTyping && <TypingIndicator />}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Clear Chat Button */}
                        {messages.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface-2 px-4 py-2">
                                <div className="container mx-auto max-w-4xl flex justify-end">
                                    <button
                                        onClick={handleClearChat}
                                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                                    >
                                        Clear Chat
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
                    </>
                )}

                {activeTab === "response" && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="container mx-auto max-w-4xl">
                            <ApiResponseView apiResponse={latestApiResponse} />
                        </div>
                    </div>
                )}

                {activeTab === "info" && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="container mx-auto px-4 py-6 max-w-4xl">
                            <InfoTab />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

function InfoTab() {
    return (
        <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-buteak-primary dark:text-buteak-gold mb-6">
                How the Chatbot Works
            </h2>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
                {/* Architecture Overview */}
                <div>
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Architecture Overview
                    </h3>
                    <p className="leading-relaxed mb-4">
                        The Buteak Suites chatbot uses a modern RAG (Retrieval-Augmented Generation) architecture
                        powered by Langchain and OpenAI's GPT-4o-mini model. This ensures accurate, context-aware
                        responses based on our hotel's actual policies and information.
                    </p>
                </div>

                {/* How It Works */}
                <div>
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        How It Works
                    </h3>
                    <ol className="space-y-3 list-decimal list-inside">
                        <li className="leading-relaxed">
                            <strong>Data Source:</strong> Hotel information, policies, and FAQs are maintained in Google Sheets for easy updates
                        </li>
                        <li className="leading-relaxed">
                            <strong>Vector Embeddings:</strong> The data is converted into vector embeddings and stored in a vector database
                        </li>
                        <li className="leading-relaxed">
                            <strong>Question Processing:</strong> When you ask a question, it's also converted to a vector embedding
                        </li>
                        <li className="leading-relaxed">
                            <strong>Similarity Search:</strong> The system finds the most relevant documents using vector similarity (cosine distance)
                        </li>
                        <li className="leading-relaxed">
                            <strong>Context Retrieval:</strong> Top 3 most relevant documents are retrieved (n_results=3)
                        </li>
                        <li className="leading-relaxed">
                            <strong>Answer Generation:</strong> The retrieved context + your question is sent to GPT-4o-mini
                        </li>
                        <li className="leading-relaxed">
                            <strong>Response:</strong> The AI generates a natural, accurate answer based on the retrieved information
                        </li>
                    </ol>
                </div>

                {/* Technical Stack */}
                <div className="mt-8 p-6 bg-gradient-to-r from-buteak-primary/10 to-buteak-gold/10 rounded-lg border border-buteak-gold/30">
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-4">
                        Technical Stack
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">AI Model</p>
                            <p className="text-base">OpenAI GPT-4o-mini</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Framework</p>
                            <p className="text-base">Langchain</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Data Source</p>
                            <p className="text-base">Google Sheets</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Storage</p>
                            <p className="text-base">Vector Database</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Results Retrieved</p>
                            <p className="text-base">3 most relevant documents</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">API Endpoint</p>
                            <p className="text-base text-xs">https://api.buteak.in/chat</p>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div>
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Why This Approach?
                    </h3>
                    <ul className="space-y-2 list-disc list-inside">
                        <li className="leading-relaxed">
                            <strong>Accuracy:</strong> Answers are based on actual hotel data, not generic AI knowledge
                        </li>
                        <li className="leading-relaxed">
                            <strong>Transparency:</strong> You can see which documents were used to generate each answer
                        </li>
                        <li className="leading-relaxed">
                            <strong>Easy Updates:</strong> Hotel staff can update information in Google Sheets without technical knowledge
                        </li>
                        <li className="leading-relaxed">
                            <strong>Relevance Scoring:</strong> Similarity scores show how confident the system is in each reference
                        </li>
                        <li className="leading-relaxed">
                            <strong>Cost-Effective:</strong> GPT-4o-mini provides excellent performance at a fraction of the cost
                        </li>
                    </ul>
                </div>

                {/* Understanding Similarity Scores */}
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Understanding Similarity Scores
                    </h3>
                    <p className="text-sm leading-relaxed mb-3">
                        The "distances" shown in the API Response tab represent how similar each retrieved document
                        is to your question. Higher scores (closer to 1.0) mean better matches.
                    </p>
                    <div className="space-y-2 text-sm">
                        <p><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span><strong>0.7 - 1.0:</strong> Excellent match (green)</p>
                        <p><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span><strong>0.5 - 0.7:</strong> Good match (yellow)</p>
                        <p><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span><strong>Below 0.5:</strong> Weak match (red)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
