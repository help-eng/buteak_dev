"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResultsTable } from "@/components/ResultsTable";
import Link from "next/link";

// Chatbot API endpoints
const CHATBOT_ENDPOINTS = [
    {
        name: "Chat - POST",
        url: "https://api.buteak.in/chat",
        method: "POST",
        body: { question: "Are couples allowed?", n_results: 3 }
    },
    {
        name: "Root - GET",
        url: "https://api.buteak.in/",
        method: "GET",
        body: null
    },
    {
        name: "Rebuild - POST",
        url: "https://api.buteak.in/rebuild",
        method: "POST",
        body: {}
    },
    {
        name: "Status - GET",
        url: "https://api.buteak.in/status",
        method: "GET",
        body: null
    },
    {
        name: "Update - POST",
        url: "https://api.buteak.in/update",
        method: "POST",
        body: {}
    }
];

// PMS API endpoints
const PMS_ENDPOINTS = [
    {
        name: "Guest Stats - POST",
        url: "https://live.ipms247.com/index.php/page/service.guestdatabase",
        method: "POST",
        requiresAuth: true,
        bodyTemplate: (hotelCode, authCode) => ({
            hotel_code: hotelCode,
            authkey: authCode
        })
    },
    {
        name: "Retrieve Guest - POST",
        url: "https://live.ipms247.com/pmsinterface/pms_connectivity.php",
        method: "POST",
        requiresAuth: true,
        bodyTemplate: (hotelCode, authCode) => ({
            RES_Request: {
                Request_Type: "GuestList",
                Authentication: {
                    HotelCode: hotelCode,
                    AuthCode: authCode
                },
                isActive: 1
            }
        })
    },
    {
        name: "Price Testing - POST",
        url: "price-testing",
        method: "POST",
        requiresAuth: true,
        isPriceTesting: true
    }
];

export default function TestAPIs() {
    const [activeTab, setActiveTab] = useState("chatbot");
    const [selectedEndpoint, setSelectedEndpoint] = useState(0);
    const [runs, setRuns] = useState(5);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // PMS credentials
    const [hotelCode, setHotelCode] = useState(process.env.NEXT_PUBLIC_HOTEL_CODE || "55402");
    const [authCode, setAuthCode] = useState(process.env.NEXT_PUBLIC_AUTH_CODE || "40230910707e9e1bd2-7813-11f0-9");

    const handleTest = async () => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const endpoints = activeTab === "chatbot" ? CHATBOT_ENDPOINTS : PMS_ENDPOINTS;
            const endpoint = endpoints[selectedEndpoint];

            let response;

            if (endpoint.isPriceTesting) {
                // Use the special price testing endpoint
                response = await fetch("/api/test-price", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hotelCode, authCode, runs })
                });
            } else {
                // Use the regular Lambda proxy
                const body = endpoint.requiresAuth
                    ? endpoint.bodyTemplate(hotelCode, authCode)
                    : endpoint.body;

                response = await fetch("/api/test-lambda", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: endpoint.url,
                        method: endpoint.method,
                        runs,
                        body
                    })
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentEndpoints = activeTab === "chatbot" ? CHATBOT_ENDPOINTS : PMS_ENDPOINTS;

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

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-buteak-primary to-buteak-gold bg-clip-text text-transparent">
                        API Testing Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Test and monitor API performance with detailed latency metrics
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => { setActiveTab("chatbot"); setSelectedEndpoint(0); setResults(null); }}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === "chatbot"
                            ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                            : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                            }`}
                    >
                        Chatbot APIs
                    </button>
                    <button
                        onClick={() => { setActiveTab("pms"); setSelectedEndpoint(0); setResults(null); }}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === "pms"
                            ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                            : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                            }`}
                    >
                        PMS APIs
                    </button>
                    <button
                        onClick={() => { setActiveTab("info"); setResults(null); }}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === "info"
                            ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                            : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                            }`}
                    >
                        Info
                    </button>
                </div>

                {/* Content */}
                {activeTab === "info" ? (
                    <InfoTab />
                ) : (
                    <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-8">
                        {/* Endpoint Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Select API Endpoint
                            </label>
                            <select
                                value={selectedEndpoint}
                                onChange={(e) => { setSelectedEndpoint(Number(e.target.value)); setResults(null); }}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all"
                            >
                                {currentEndpoints.map((endpoint, idx) => (
                                    <option key={idx} value={idx}>
                                        {endpoint.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PMS Credentials */}
                        {activeTab === "pms" && (
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Hotel Code
                                    </label>
                                    <input
                                        type="password"
                                        value={hotelCode}
                                        onChange={(e) => setHotelCode(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all"
                                        placeholder="Enter hotel code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Auth Code
                                    </label>
                                    <input
                                        type="password"
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all"
                                        placeholder="Enter auth code"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Runs Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Number of Runs
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={runs}
                                onChange={(e) => setRuns(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Invoke Button */}
                        <button
                            onClick={handleTest}
                            disabled={loading}
                            className="w-full px-8 py-4 bg-gradient-to-r from-buteak-primary to-buteak-gold text-white rounded-lg font-semibold hover:shadow-elevation-3 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Testing...
                                </span>
                            ) : (
                                "Invoke Test"
                            )}
                        </button>

                        {/* Error Display */}
                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fadeIn">
                                <p className="text-red-800 dark:text-red-300 font-semibold">Error: {error}</p>
                            </div>
                        )}

                        {/* Results */}
                        {results && <ResultsTable results={results} />}
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
                Why Use AWS Lambda for API Testing?
            </h2>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <div>
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Consistent Network Conditions
                    </h3>
                    <p className="leading-relaxed">
                        Testing from AWS Lambda ensures consistent network conditions across all tests. Unlike local testing,
                        which can be affected by varying WiFi speeds, network congestion, or ISP throttling, Lambda provides
                        a stable baseline for measuring true API performance.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        No Local Network Dependency
                    </h3>
                    <p className="leading-relaxed">
                        Your local network speed and reliability don't impact the test results. This is crucial for getting
                        accurate latency measurements that reflect the actual API performance rather than your internet connection quality.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Cloud-to-Cloud Testing
                    </h3>
                    <p className="leading-relaxed">
                        Since most production APIs run in the cloud, testing from AWS Lambda (also in the cloud) provides
                        more realistic latency measurements that your actual users will experience when accessing your APIs
                        from cloud-based applications.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Centralized Testing Infrastructure
                    </h3>
                    <p className="leading-relaxed">
                        Lambda provides a centralized, scalable testing infrastructure. You can run multiple tests concurrently
                        without worrying about local resource constraints, and all team members get the same testing environment.
                    </p>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-buteak-primary/10 to-buteak-gold/10 rounded-lg border border-buteak-gold/30">
                    <h3 className="text-xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                        Technical Architecture
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>Lambda Function URL:</strong> <code className="px-2 py-1 bg-gray-200 dark:bg-dark-surface-3 rounded text-xs">
                            https://m3z7glulygvb7pd2w63eqjqfze0lnjfa.lambda-url.ap-south-1.on.aws/
                        </code></p>
                        <p><strong>Region:</strong> ap-south-1 (Mumbai)</p>
                        <p><strong>Runtime:</strong> Python 3.x</p>
                        <p><strong>Metrics Collected:</strong> Average Latency, Max Latency, P95 Latency, Status Codes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
