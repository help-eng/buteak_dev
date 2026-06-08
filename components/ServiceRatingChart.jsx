"use client";

const RATING_ORDER = ["Good", "Bad", "Not Rated"];

const COLORS = {
    Good: "#10B981",      // green
    Bad: "#EF4444",       // red
    "Not Rated": "#9CA3AF", // gray
};

export function ServiceRatingChart({ data }) {
    if (!data) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>No rating data available</p>
            </div>
        );
    }

    // Force the three buckets to always render — even if zero — so the chart
    // shape is predictable. Other ratings (if Zoho ever picks up new picklist
    // values) get folded into "Other" at the end.
    const knownTotal = RATING_ORDER.reduce((sum, k) => sum + (data[k] || 0), 0);
    const extraTotal = Object.entries(data)
        .filter(([k]) => !RATING_ORDER.includes(k))
        .reduce((sum, [, v]) => sum + v, 0);
    const total = knownTotal + extraTotal;

    if (total === 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Service Rating
                </h3>
                <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                    <p>No rating data yet</p>
                </div>
            </div>
        );
    }

    const entries = [
        ...RATING_ORDER.map((rating) => ({
            rating,
            count: data[rating] || 0,
            color: COLORS[rating],
        })),
    ];
    if (extraTotal > 0) {
        entries.push({ rating: "Other", count: extraTotal, color: "#6B7280" });
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Service Rating
            </h3>

            <div className="space-y-3">
                {entries.map(({ rating, count, color }) => {
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
                    return (
                        <div key={rating}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {rating}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {count} ({percentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
