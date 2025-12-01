"use client";

import { useState } from "react";

export function ApiResponseView({ apiResponse }) {
    const [expandedDocs, setExpandedDocs] = useState([]);

    if (!apiResponse) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>Send a message to see the API response</p>
            </div>
        );
    }

    const toggleDoc = (index) => {
        setExpandedDocs(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const getScoreColor = (distance) => {
        if (distance >= 0.7) return "text-green-600 dark:text-green-400";
        if (distance >= 0.5) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreBadge = (distance) => {
        if (distance >= 0.7) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
        if (distance >= 0.5) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    };

    return (
        <div className="space-y-6 p-6">
            {/* Answer Section */}
            <div className="bg-gradient-to-r from-buteak-primary/10 to-buteak-gold/10 rounded-lg p-6 border border-buteak-gold/30">
                <h3 className="text-lg font-semibold text-buteak-primary dark:text-buteak-gold mb-3">
                    Answer
                </h3>
                <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                    {apiResponse.answer}
                </p>
            </div>

            {/* Question */}
            <div className="bg-white dark:bg-dark-surface-2 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Question:</span> {apiResponse.question}
                </p>
            </div>

            {/* Relevant Documents */}
            <div>
                <h3 className="text-lg font-semibold text-buteak-primary dark:text-buteak-gold mb-4">
                    References ({apiResponse.relevant_docs?.length || 0})
                </h3>

                <div className="space-y-3">
                    {apiResponse.relevant_docs?.map((doc, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-dark-surface-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all"
                        >
                            {/* Header */}
                            <button
                                onClick={() => toggleDoc(index)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-surface-3 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Reference {index + 1}
                                    </span>
                                    {apiResponse.distances && apiResponse.distances[index] !== undefined && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreBadge(apiResponse.distances[index])}`}>
                                            {(apiResponse.distances[index] * 100).toFixed(1)}% match
                                        </span>
                                    )}
                                </div>

                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedDocs.includes(index) ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Expanded Content */}
                            {expandedDocs.includes(index) && (
                                <div className="px-4 pb-4 space-y-3 animate-slideUp">
                                    {/* Question */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                            Question:
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            {doc.Question}
                                        </p>
                                    </div>

                                    {/* Answer */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                            Answer:
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            {doc.Answer}
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    {doc.Tags && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                                Tags:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {doc.Tags.split(',').map((tag, tagIndex) => (
                                                    <span
                                                        key={tagIndex}
                                                        className="px-2 py-1 bg-buteak-primary/10 text-buteak-primary dark:bg-buteak-gold/10 dark:text-buteak-gold rounded text-xs"
                                                    >
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Similarity Score */}
                                    {apiResponse.distances && apiResponse.distances[index] !== undefined && (
                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Similarity Score: <span className={`font-semibold ${getScoreColor(apiResponse.distances[index])}`}>
                                                    {apiResponse.distances[index].toFixed(4)}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Raw JSON (Collapsible) */}
            <details className="bg-gray-50 dark:bg-dark-surface-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <summary className="px-4 py-3 cursor-pointer font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-4 transition-colors">
                    View Raw JSON
                </summary>
                <div className="px-4 pb-4">
                    <pre className="text-xs bg-gray-900 dark:bg-black text-green-400 p-4 rounded overflow-x-auto">
                        {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                </div>
            </details>
        </div>
    );
}
