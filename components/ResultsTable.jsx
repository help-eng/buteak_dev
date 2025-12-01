"use client";

import { useState } from "react";

export function ResultsTable({ results }) {
    const [showIndividual, setShowIndividual] = useState(false);

    if (!results) {
        return null;
    }

    const getStatusColor = (code) => {
        if (code === 200) return "text-green-600 dark:text-green-400";
        if (code >= 400) return "text-red-600 dark:text-red-400";
        return "text-yellow-600 dark:text-yellow-400";
    };

    return (
        <div className="mt-6 animate-fadeIn">
            <div className="overflow-x-auto rounded-lg shadow-elevation-2">
                <table className="w-full bg-white dark:bg-dark-surface-2 border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-buteak-primary to-buteak-gold text-white">
                            <th className="px-6 py-4 text-left font-semibold">Status Code</th>
                            <th className="px-6 py-4 text-left font-semibold">Max Latency (ms)</th>
                            <th className="px-6 py-4 text-left font-semibold">Avg Latency (ms)</th>
                            <th className="px-6 py-4 text-left font-semibold">P95 Latency (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-surface-3 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {results.status_codes?.map((code, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(code)}`}
                                        >
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-lg font-semibold text-buteak-primary dark:text-buteak-gold">
                                {results.max_latency_ms}
                            </td>
                            <td className="px-6 py-4 font-mono text-lg font-semibold text-buteak-primary dark:text-buteak-gold">
                                {results.average_latency_ms}
                            </td>
                            <td className="px-6 py-4 font-mono text-lg font-semibold text-buteak-primary dark:text-buteak-gold">
                                {results.p95_latency_ms}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Individual Latencies Section */}
            {results.individual_latencies_ms && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowIndividual(!showIndividual)}
                        className="flex items-center gap-2 text-buteak-primary dark:text-buteak-gold font-semibold hover:underline transition-all"
                    >
                        <svg
                            className={`w-5 h-5 transform transition-transform ${showIndividual ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {showIndividual ? 'Hide' : 'Show'} Individual Latencies
                    </button>

                    {showIndividual && (
                        <div className="mt-3 p-4 bg-gray-50 dark:bg-dark-surface-3 rounded-lg animate-slideUp">
                            <div className="flex flex-wrap gap-2">
                                {results.individual_latencies_ms.map((latency, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-2 bg-white dark:bg-dark-surface-2 rounded-lg text-sm font-mono border border-gray-200 dark:border-gray-700"
                                    >
                                        Run {idx + 1}: <span className="font-bold text-buteak-primary dark:text-buteak-gold">
                                            {latency !== null ? `${latency} ms` : 'Failed'}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* API Info */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-dark-surface-3 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">URL:</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400 break-all">{results.url}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Method:</span>{' '}
                        <span className="px-2 py-1 bg-buteak-primary text-white rounded text-xs font-semibold">
                            {results.method}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Total Runs:</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{results.runs}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
