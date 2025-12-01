"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ChatbotControls() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState({
        update: false,
        rebuild: false,
    });
    const [results, setResults] = useState({
        update: null,
        rebuild: null,
    });

    const handleLogin = (e) => {
        e.preventDefault();
        const correctPassword = process.env.NEXT_PUBLIC_CONTROLS_PASSWORD || "Buteak@2025";

        if (password === correctPassword) {
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("Incorrect password. Please try again.");
            setPassword("");
        }
    };

    const handleUpdate = async () => {
        setLoading(prev => ({ ...prev, update: true }));
        setResults(prev => ({ ...prev, update: null }));

        try {
            const response = await fetch("/api/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResults(prev => ({ ...prev, update: { success: true, data } }));
        } catch (err) {
            setResults(prev => ({ ...prev, update: { success: false, error: err.message } }));
        } finally {
            setLoading(prev => ({ ...prev, update: false }));
        }
    };

    const handleRebuild = async () => {
        const confirmed = confirm(
            "⚠️ WARNING: This will rebuild the entire vector database from scratch!\n\n" +
            "This operation:\n" +
            "• Will cost a significant amount of tokens\n" +
            "• Should only be used for major changes\n" +
            "• May take several minutes to complete\n\n" +
            "For small changes, use the UPDATE button instead.\n\n" +
            "Are you sure you want to continue?"
        );

        if (!confirmed) return;

        setLoading(prev => ({ ...prev, rebuild: true }));
        setResults(prev => ({ ...prev, rebuild: null }));

        try {
            const response = await fetch("/api/rebuild", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResults(prev => ({ ...prev, rebuild: { success: true, data } }));
        } catch (err) {
            setResults(prev => ({ ...prev, rebuild: { success: false, error: err.message } }));
        } finally {
            setLoading(prev => ({ ...prev, rebuild: false }));
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-surface-1 flex items-center justify-center">
                <ThemeToggle />

                <div className="w-full max-w-md px-4">
                    <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-4 p-8 animate-fadeIn">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-buteak-primary to-buteak-gold flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-buteak-primary dark:text-buteak-gold mb-2">
                                Chatbot Controls
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Enter password to access controls
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all"
                                    placeholder="Enter password"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-gradient-to-r from-buteak-primary to-buteak-gold text-white rounded-lg font-semibold hover:shadow-elevation-3 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                Access Controls
                            </button>

                            <Link href="/" className="block text-center text-sm text-buteak-primary dark:text-buteak-gold hover:underline">
                                Back to Home
                            </Link>
                        </form>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-surface-1">
            <ThemeToggle />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-buteak-primary dark:text-buteak-gold hover:underline mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-buteak-primary to-buteak-gold bg-clip-text text-transparent">
                                Chatbot Controls
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Manage chatbot data and vector database
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Control Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl">
                    {/* Edit Sheet Card */}
                    <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 animate-fadeIn">
                        <div className="w-12 h-12 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-buteak-primary dark:text-buteak-gold mb-2">
                            Edit Sheet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Open Google Sheets to edit chatbot data
                        </p>

                        <a
                            href="https://docs.google.com/spreadsheets/d/1hfOUQ2UuCpIHGyFp8XLa7XOMf5pUocwxyTjs7IPrpuI/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            Open in Google Sheets
                        </a>
                    </div>

                    {/* Update Card */}
                    <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        <div className="w-12 h-12 mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-buteak-primary dark:text-buteak-gold mb-2">
                            Update Database
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Update vector DB with recent changes (recommended for small edits)
                        </p>

                        <button
                            onClick={handleUpdate}
                            disabled={loading.update}
                            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading.update ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </span>
                            ) : (
                                "Update"
                            )}
                        </button>

                        {results.update && (
                            <div className={`mt-3 p-3 rounded-lg ${results.update.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                <p className={`text-sm ${results.update.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                    {results.update.success ? '✓ Update successful!' : `✗ Error: ${results.update.error}`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Rebuild Card */}
                    <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>

                            {/* Warning Icon with Tooltip */}
                            <div className="group relative">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>

                                {/* Tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                                    <p className="font-semibold mb-1">⚠️ Warning:</p>
                                    <p className="mb-2">
                                        This route rebuilds the entire vector database from scratch. It will:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 mb-2">
                                        <li>Cost a lot of tokens</li>
                                        <li>Take several minutes</li>
                                        <li>Should only be used for major changes</li>
                                    </ul>
                                    <p className="font-semibold">
                                        Use UPDATE for small changes instead!
                                    </p>
                                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-buteak-primary dark:text-buteak-gold mb-2">
                            Rebuild Database
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Rebuild entire vector DB from scratch (use only for major changes)
                        </p>

                        <button
                            onClick={handleRebuild}
                            disabled={loading.rebuild}
                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading.rebuild ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Rebuilding...
                                </span>
                            ) : (
                                "Rebuild"
                            )}
                        </button>

                        {results.rebuild && (
                            <div className={`mt-3 p-3 rounded-lg ${results.rebuild.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                <p className={`text-sm ${results.rebuild.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                    {results.rebuild.success ? '✓ Rebuild successful!' : `✗ Error: ${results.rebuild.error}`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 max-w-6xl bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Usage Guidelines
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><strong>1. Edit Sheet:</strong> Make changes to the Google Sheets document</p>
                        <p><strong>2. Update:</strong> For small changes (adding/editing a few rows), click UPDATE to sync the database</p>
                        <p><strong>3. Rebuild:</strong> Only use for major structural changes or when UPDATE doesn't work. This is expensive!</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
