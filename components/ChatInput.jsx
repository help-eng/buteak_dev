"use client";

import { useState } from "react";

export function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface-2 p-4">
            <div className="flex gap-3 items-end max-w-4xl mx-auto">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-32 overflow-y-auto"
                    style={{
                        minHeight: '48px',
                        height: 'auto',
                    }}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                />

                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="px-6 py-3 bg-gradient-to-r from-buteak-primary to-buteak-gold text-white rounded-lg font-semibold hover:shadow-elevation-3 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                </button>
            </div>
        </form>
    );
}
