"use client";

export function StatusChart({ data }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>No status data available</p>
            </div>
        );
    }

    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const colors = {
        Open: "#3B82F6",
        "In Progress": "#F59E0B",
        Resolved: "#10B981",
        Closed: "#6B7280",
        Pending: "#8B5CF6",
        Cancelled: "#EF4444",
    };

    const entries = Object.entries(data).map(([status, count]) => ({
        status,
        count,
        percentage: ((count / total) * 100).toFixed(1),
        color: colors[status] || "#6B7280",
    }));

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Status Breakdown
            </h3>

            {/* Legend and Bars */}
            <div className="space-y-3">
                {entries.map(({ status, count, percentage, color }) => (
                    <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {status}
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
                ))}
            </div>
        </div>
    );
}
