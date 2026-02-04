"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatCard } from "@/components/StatCard";
import { StatusChart } from "@/components/StatusChart";
import { TypeChart } from "@/components/TypeChart";
import { RoomChart } from "@/components/RoomChart";

export default function ButeakStatistics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [totalFetched, setTotalFetched] = useState(0);

    // Date filter state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchData = async (applyFilters = true) => {
        setLoading(true);
        setError(null);

        try {
            // Build URL with query parameters
            const params = new URLSearchParams();
            if (applyFilters && startDate) params.append("startDate", startDate);
            if (applyFilters && endDate) params.append("endDate", endDate);

            const url = `/api/zoho-service-requests${params.toString() ? '?' + params.toString() : ''}`;
            console.log('Fetching:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to fetch data");
            }

            setData(result.data);
            setTotalFetched(result.total_fetched || result.data?.total_count || 0);
            setLastUpdated(result.last_updated);
        } catch (err) {
            console.error("Error fetching statistics:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatLastUpdated = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-surface-1">
            <ThemeToggle />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-buteak-primary dark:text-buteak-gold hover:underline mb-4"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Home
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-buteak-primary to-buteak-gold bg-clip-text text-transparent">
                                Buteak Statistics
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Real-time service requests and hotel performance metrics
                            </p>
                            {lastUpdated && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Last updated: {formatLastUpdated(lastUpdated)} | Total Records: {totalFetched}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="px-4 py-2 bg-buteak-primary hover:bg-buteak-primary/90 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                        >
                            <svg
                                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Refresh
                        </button>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mt-6 p-4 bg-white dark:bg-dark-surface-2 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    From:
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 bg-gray-50 dark:bg-dark-surface-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    To:
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 bg-gray-50 dark:bg-dark-surface-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => fetchData(true)}
                                disabled={loading}
                                className="px-4 py-2 bg-buteak-gold hover:bg-buteak-gold/90 text-dark-bg font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Apply Filter
                            </button>
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => {
                                        clearFilters();
                                        // Fetch without filters after clearing
                                        setTimeout(() => fetchData(false), 100);
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                        {(startDate || endDate) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Showing: {startDate || 'All Start'} → {endDate || 'All End'} |
                                Filtered: {data?.total_count || 0} of {totalFetched} records
                            </p>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && !data && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <svg
                                className="animate-spin h-12 w-12 text-buteak-gold mx-auto mb-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">
                                Loading statistics...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 animate-fadeIn">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
                                    Error Loading Data
                                </h3>
                                <p className="text-red-700 dark:text-red-400 mb-3">
                                    {error}
                                </p>
                                <button
                                    onClick={fetchData}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Display */}
                {data && !loading && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Requests"
                                value={data.total_count}
                                color="blue"
                                icon={
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Open Requests"
                                value={data.by_status?.Open || 0}
                                color="yellow"
                                icon={
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="In Progress"
                                value={data.by_status?.["In Progress"] || 0}
                                color="purple"
                                icon={
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Resolved"
                                value={data.by_status?.Resolved || 0}
                                color="green"
                                icon={
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                }
                            />
                        </div>

                        {/* Charts Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Status Chart */}
                            <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 border border-gray-200 dark:border-gray-700">
                                <StatusChart data={data.by_status} />
                            </div>

                            {/* Type Chart */}
                            <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 border border-gray-200 dark:border-gray-700">
                                <TypeChart data={data.by_type} />
                            </div>

                            {/* Room Chart */}
                            <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 border border-gray-200 dark:border-gray-700">
                                <RoomChart data={data.by_room} />
                            </div>

                            {/* Recent Requests */}
                            <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Recent Requests
                                </h3>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {data.recent_requests?.length > 0 ? (
                                        data.recent_requests.map((req) => (
                                            <div
                                                key={req.id}
                                                className="p-3 bg-gray-50 dark:bg-dark-surface-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                        Room {req.room}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                                        {req.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {req.type}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {new Date(req.created_time).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                            No recent requests
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
