"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function EscalationControls() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveResult, setSaveResult] = useState(null);
    const [activeTab, setActiveTab] = useState("config");

    // Configuration state (in milliseconds)
    const [timings, setTimings] = useState({
        T1: 10000,
        T2: 60000,
        T3: 120000,
        T4: 0,
        escalationWait: 20000,
    });

    // Display state (hours, minutes, seconds)
    const [displayTimings, setDisplayTimings] = useState({
        T1: { hours: 0, minutes: 0, seconds: 10 },
        T2: { hours: 0, minutes: 1, seconds: 0 },
        T3: { hours: 0, minutes: 2, seconds: 0 },
        escalationWait: { hours: 0, minutes: 0, seconds: 20 },
    });

    const [levels, setLevels] = useState({
        L1: "Reception",
        L2: "Manager",
        L3: "Owner",
        L4: "Director",
    });

    // Convert milliseconds to hours, minutes, seconds
    const msToDisplay = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    };

    // Convert hours, minutes, seconds to milliseconds
    const displayToMs = (hours, minutes, seconds) => {
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    };

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

    // Fetch configuration on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchConfiguration();
        }
    }, [isAuthenticated]);

    const fetchConfiguration = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/escalation-config");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success && data.data) {
                console.log('Fetched timings (ms):', data.data.timings);

                setTimings(data.data.timings);
                setLevels(data.data.levels || {});

                // Convert to display format
                const displayT1 = msToDisplay(data.data.timings.T1);
                const displayT2 = msToDisplay(data.data.timings.T2);
                const displayT3 = msToDisplay(data.data.timings.T3);
                const displayEscalationWait = msToDisplay(data.data.timings.escalationWait);

                console.log('Converted T1:', displayT1, 'from', data.data.timings.T1, 'ms');
                console.log('Converted T2:', displayT2, 'from', data.data.timings.T2, 'ms');
                console.log('Converted T3:', displayT3, 'from', data.data.timings.T3, 'ms');
                console.log('Converted escalationWait:', displayEscalationWait, 'from', data.data.timings.escalationWait, 'ms');

                setDisplayTimings({
                    T1: displayT1,
                    T2: displayT2,
                    T3: displayT3,
                    escalationWait: displayEscalationWait,
                });
            }
        } catch (err) {
            console.error("Error fetching configuration:", err);
            setError("Failed to load configuration: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisplayTimingChange = (key, field, value) => {
        setDisplayTimings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: parseInt(value) || 0,
            },
        }));
    };

    const handleLevelChange = (key, value) => {
        setLevels(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const addNewLevel = () => {
        const levelKeys = Object.keys(levels).sort();
        const lastKey = levelKeys[levelKeys.length - 1];
        const lastNumber = parseInt(lastKey.substring(1));
        const newKey = `L${lastNumber + 1}`;

        setLevels(prev => ({
            ...prev,
            [newKey]: "",
        }));
    };

    const removeLevel = (key) => {
        const newLevels = { ...levels };
        delete newLevels[key];
        setLevels(newLevels);
    };

    const validateConfiguration = () => {
        const errors = [];

        // Convert display timings to milliseconds for validation
        const msTimings = {
            T1: displayToMs(displayTimings.T1.hours, displayTimings.T1.minutes, displayTimings.T1.seconds),
            T2: displayToMs(displayTimings.T2.hours, displayTimings.T2.minutes, displayTimings.T2.seconds),
            T3: displayToMs(displayTimings.T3.hours, displayTimings.T3.minutes, displayTimings.T3.seconds),
            T4: 0, // Always 0
            escalationWait: displayToMs(displayTimings.escalationWait.hours, displayTimings.escalationWait.minutes, displayTimings.escalationWait.seconds),
        };

        // Validate timings
        Object.entries(msTimings).forEach(([key, value]) => {
            if (typeof value !== 'number' || value < 0 || isNaN(value)) {
                errors.push(`${key} must be a valid non-negative number`);
            }
        });

        // Validate display values - at least one field should be greater than 0 (except T4)
        Object.entries(displayTimings).forEach(([key, { hours, minutes, seconds }]) => {
            if (hours === 0 && minutes === 0 && seconds === 0) {
                errors.push(`${key} must be greater than 0`);
            }
        });

        // Validate levels
        Object.entries(levels).forEach(([key, value]) => {
            if (!key.match(/^L\d+$/)) {
                errors.push(`Invalid level key: ${key}. Must match pattern L0, L1, L2, L3, etc.`);
            }
            if (!value || value.trim() === "") {
                errors.push(`Level ${key} must have a non-empty role name`);
            }
        });

        return { errors, msTimings };
    };

    const handleSave = async () => {
        setSaveResult(null);

        // Validate and get millisecond timings
        const { errors, msTimings } = validateConfiguration();
        if (errors.length > 0) {
            setSaveResult({
                success: false,
                message: "Validation failed",
                errors: errors,
            });
            return;
        }

        setSaveLoading(true);
        try {
            const payload = {
                timings: msTimings,
                levels: levels,
            };

            const response = await fetch("/api/escalation-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setSaveResult({
                    success: true,
                    message: "Configuration updated successfully!",
                });
                // Update internal timings state
                setTimings(msTimings);
            } else {
                setSaveResult({
                    success: false,
                    message: data.message || "Failed to update configuration",
                    errors: data.errors || [],
                });
            }
        } catch (err) {
            setSaveResult({
                success: false,
                message: "Error updating configuration: " + err.message,
            });
        } finally {
            setSaveLoading(false);
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
                                Escalation Controls
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
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-buteak-primary dark:text-buteak-gold hover:underline mb-4 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-buteak-primary to-buteak-gold bg-clip-text text-transparent break-words">
                                Escalation Controls
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                                Manage escalation timings and staff levels
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="px-3 py-1.5 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:underline whitespace-nowrap flex-shrink-0"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 sm:gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("config")}
                        className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === "config"
                            ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                            : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                            }`}
                    >
                        Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab("info")}
                        className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === "info"
                            ? "border-b-2 border-buteak-gold text-buteak-primary dark:text-buteak-gold"
                            : "text-gray-600 dark:text-gray-400 hover:text-buteak-primary dark:hover:text-buteak-gold"
                            }`}
                    >
                        Info
                    </button>
                </div>

                {activeTab === "config" && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <svg className="animate-spin h-8 w-8 text-buteak-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6 max-w-6xl">
                                {/* Timings Section */}
                                <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 animate-fadeIn">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-buteak-primary dark:text-buteak-gold">
                                            Timings
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(displayTimings).map(([key, { hours, minutes, seconds }]) => (
                                            <div key={key}>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    {key}
                                                    {key === "escalationWait" && <span className="ml-2 text-xs text-gray-500">(Wait between levels)</span>}
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hours</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="23"
                                                            value={hours}
                                                            onChange={(e) => handleDisplayTimingChange(key, 'hours', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all text-center"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={minutes}
                                                            onChange={(e) => handleDisplayTimingChange(key, 'minutes', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all text-center"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Seconds</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={seconds}
                                                            onChange={(e) => handleDisplayTimingChange(key, 'seconds', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all text-center"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <strong>Note:</strong> T4 (Critical Emergency) is always set to 0 for immediate broadcast and is not shown here.
                                        </p>
                                    </div>
                                </div>

                                {/* Levels Section */}
                                <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-2xl font-bold text-buteak-primary dark:text-buteak-gold">
                                                Staff Levels
                                            </h2>
                                        </div>
                                        <button
                                            onClick={addNewLevel}
                                            className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all transform hover:scale-110"
                                            title="Add new level"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {Object.entries(levels).sort((a, b) => {
                                            const numA = parseInt(a[0].substring(1));
                                            const numB = parseInt(b[0].substring(1));
                                            return numA - numB;
                                        }).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <div className="w-16 px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 text-center font-semibold">
                                                    {key}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => handleLevelChange(key, e.target.value)}
                                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-buteak-gold focus:border-transparent transition-all"
                                                    placeholder="Enter role name"
                                                />
                                                <button
                                                    onClick={() => removeLevel(key)}
                                                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all transform hover:scale-110"
                                                    title="Remove level"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <strong>Tip:</strong> Click + to add new levels. Levels must follow pattern L1, L2, L3, etc.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        {!loading && (
                            <div className="mt-6 max-w-6xl">
                                <button
                                    onClick={handleSave}
                                    disabled={saveLoading}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-buteak-primary to-buteak-gold text-white rounded-lg font-semibold hover:shadow-elevation-3 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {saveLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>

                                {/* Save Result */}
                                {saveResult && (
                                    <div className={`mt-4 p-4 rounded-lg ${saveResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                        <p className={`font-semibold ${saveResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                            {saveResult.message}
                                        </p>
                                        {saveResult.errors && saveResult.errors.length > 0 && (
                                            <ul className="mt-2 list-disc list-inside text-sm text-red-700 dark:text-red-400">
                                                {saveResult.errors.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "info" && (
                    <InfoTab />
                )}
            </div>
        </main>
    );
}

function InfoTab() {
    return (
        <div className="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-elevation-3 p-4 sm:p-6 md:p-8 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold text-buteak-primary dark:text-buteak-gold mb-4 sm:mb-6">
                Task Categories & Escalation Levels
            </h2>

            {/* Task Categories Table */}
            <div className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3 sm:mb-4">
                    📋 Task Categories
                </h3>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-buteak-primary to-buteak-gold text-white">
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Category</th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Name</th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Typical Time</th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Examples</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-blue-50 dark:bg-blue-900/20">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold">T1</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Immediate Response</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">0-15 min</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Bring towel, invoice, water, toiletries, blankets</td>
                            </tr>
                            <tr className="bg-green-50 dark:bg-green-900/20">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold">T2</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Standard Service</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">15-60 min</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Food delivery, room cleaning, laundry, room turnover</td>
                            </tr>
                            <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold">T3</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Technical Issues</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">1-12 hrs</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">TV, Wi-Fi, AC, plumbing, electrical, appliances</td>
                            </tr>
                            <tr className="bg-red-50 dark:bg-red-900/20">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold">T4</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Critical (Emergency)</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Immediate</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Leakage, fire, electrical hazard, medical emergency</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-buteak-primary dark:text-buteak-gold">T1</span>
                            <span className="font-semibold">Immediate Response</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Time:</strong> 0-15 min</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Examples:</strong> Bring towel, invoice, water, toiletries, blankets</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-buteak-primary dark:text-buteak-gold">T2</span>
                            <span className="font-semibold">Standard Service</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Time:</strong> 15-60 min</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Examples:</strong> Food delivery, room cleaning, laundry, room turnover</p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-buteak-primary dark:text-buteak-gold">T3</span>
                            <span className="font-semibold">Technical Issues</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Time:</strong> 1-12 hrs</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Examples:</strong> TV, Wi-Fi, AC, plumbing, electrical, appliances</p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-buteak-primary dark:text-buteak-gold">T4</span>
                            <span className="font-semibold">Critical (Emergency)</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Time:</strong> Immediate</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Examples:</strong> Leakage, fire, electrical hazard, medical emergency</p>
                    </div>
                </div>
            </div>

            {/* Escalation Levels */}
            <div className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3 sm:mb-4">
                    👥 Escalation Levels
                </h3>
                <div className="space-y-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            <strong className="text-buteak-primary dark:text-buteak-gold">L1, L2, L3, ..., Ln:</strong> These represent the hierarchy of staff members who will be notified if a task is not acknowledged. Each level typically represents a higher authority or responsibility.
                        </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <strong>Example:</strong> L1 = Reception → L2 = Manager → L3 = Owner → L4 = Director
                        </p>
                    </div>
                </div>
            </div>

            {/* How to Set Timings */}
            <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-buteak-primary dark:text-buteak-gold mb-3 sm:mb-4">
                    ⚙️ How to Set Timings
                </h3>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <p>
                        <strong>T1 (Immediate Response):</strong> Set a short time (e.g., 10-30 seconds) for quick tasks that staff should handle immediately.
                    </p>
                    <p>
                        <strong>T2 (Standard Service):</strong> Set a moderate time (e.g., 1-5 minutes) for standard operational tasks like food delivery or cleaning.
                    </p>
                    <p>
                        <strong>T3 (Technical Issues):</strong> Set a longer time (e.g., 5-30 minutes) for complex technical work that may require diagnosis and repair.
                    </p>
                    <p>
                        <strong>T4 (Critical Emergency):</strong> Always set to 0 (immediate broadcast). This ensures all levels are notified simultaneously for emergencies.
                    </p>
                    <p>
                        <strong>Escalation Wait:</strong> Time to wait between escalation levels (e.g., 20-60 seconds). If a task is not acknowledged at L1 within this time, it escalates to L2, and so on.
                    </p>
                </div>
            </div>
        </div>
    );
}
