"use client";

export function TypeChart({ data }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>No type data available</p>
            </div>
        );
    }

    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const maxCount = Math.max(...Object.values(data));

    const colors = [
        "#0B3C49", // buteak-primary
        "#D4A437", // buteak-gold
        "#3B82F6", // blue
        "#10B981", // green
        "#F59E0B", // yellow
        "#8B5CF6", // purple
        "#EF4444", // red
        "#EC4899", // pink
    ];

    const entries = Object.entries(data)
        .map(([type, count], index) => ({
            type,
            count,
            percentage: ((count / total) * 100).toFixed(1),
            barHeight: (count / maxCount) * 100,
            color: colors[index % colors.length],
        }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Type Breakdown
            </h3>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3">
                {entries.map(({ type, count, percentage, color }) => (
                    <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {type}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {count} ({percentage}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className="h-3 rounded-full transition-all duration-500"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: color,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
