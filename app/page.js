"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-surface-1">
            <ThemeToggle />

            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16 animate-fadeIn">
                    <div className="flex justify-center mb-8">
                        <div className="relative w-32 h-32 animate-pulse-slow">
                            <Image
                                src="/logos/logo.svg"
                                alt="Buteak Suites Logo"
                                width={128}
                                height={128}
                                priority
                                className="drop-shadow-2xl"
                            />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-buteak-primary to-buteak-gold bg-clip-text text-transparent">
                        Welcome to Buteak Suites
                    </h1>

                    <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-light">
                        Dev Website
                    </p>

                    <div className="mt-6 w-24 h-1 bg-gradient-to-r from-buteak-primary to-buteak-gold mx-auto rounded-full"></div>
                </div>

                {/* Navigation Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Test APIs Card */}
                    <Link href="/test-apis">
                        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface-2 p-8 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-300 cursor-pointer animate-slideUp border border-gray-200 dark:border-gray-700">
                            <div className="absolute inset-0 bg-gradient-to-br from-buteak-primary/10 to-buteak-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-buteak-primary to-buteak-gold flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl font-bold mb-3 text-buteak-primary dark:text-buteak-gold">
                                    Test APIs
                                </h2>

                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Test and monitor Chatbot and PMS API performance with detailed latency metrics
                                </p>

                                <div className="mt-6 flex items-center text-buteak-gold group-hover:translate-x-2 transition-transform duration-300">
                                    <span className="font-semibold">Get Started</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Test Chatbot Card */}
                    <Link href="/test-chatbot">
                        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface-2 p-8 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-300 cursor-pointer animate-slideUp border border-gray-200 dark:border-gray-700" style={{ animationDelay: '0.1s' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-buteak-primary/10 to-buteak-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-buteak-primary to-buteak-gold flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl font-bold mb-3 text-buteak-primary dark:text-buteak-gold">
                                    Test Chatbot
                                </h2>

                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Chat with Buteak Suites AI assistant powered by Langchain and GPT-4o-mini
                                </p>

                                <div className="mt-6 flex items-center text-buteak-gold group-hover:translate-x-2 transition-transform duration-300">
                                    <span className="font-semibold">Start Chatting</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Chatbot Controls Card */}
                    <Link href="/chatbot-controls">
                        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface-2 p-8 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-300 cursor-pointer animate-slideUp border border-gray-200 dark:border-gray-700" style={{ animationDelay: '0.2s' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-buteak-primary/10 to-buteak-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-buteak-primary to-buteak-gold flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl font-bold mb-3 text-buteak-primary dark:text-buteak-gold">
                                    Chatbot Controls
                                </h2>

                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Edit Google Sheets data, update or rebuild the vector database
                                </p>

                                <div className="mt-6 flex items-center text-buteak-gold group-hover:translate-x-2 transition-transform duration-300">
                                    <span className="font-semibold">Manage Controls</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Buteak Suites Development Dashboard</p>
                </div>
            </div>
        </main>
    );
}
