"use client";

export function RoomChart({ data }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>No room data available</p>
            </div>
        );
    }

    // Get top 10 rooms by request count
    const entries = Object.entries(data)
        .map(([room, count]) => ({ room, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const maxCount = Math.max(...entries.map((e) => e.count));

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top 10 Rooms by Requests
            </h3>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3">
                {entries.map(({ room, count }, index) => {
                    const percentage = ((count / maxCount) * 100).toFixed(0);
                    const color = index < 3 ? "#EF4444" : "#0B3C49"; // Red for top 3, primary for rest

                    return (
                        <div key={room}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Room {room}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {count} requests
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
                    );
                })}
            </div>

            {Object.keys(data).length > 10 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Showing top 10 of {Object.keys(data).length} rooms
                </p>
            )}
        </div>
    );
}
