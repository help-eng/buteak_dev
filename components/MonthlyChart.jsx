"use client";

export function MonthlyChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>No monthly data available</p>
            </div>
        );
    }

    // Find the max value for scaling
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Service Requests - Last 12 Months
            </h3>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48 px-2">
                {data.map((item, idx) => {
                    const heightPercent = (item.count / maxCount) * 100;
                    const isCurrentMonth = idx === data.length - 1;

                    return (
                        <div
                            key={`${item.month}-${item.year}`}
                            className="flex flex-col items-center flex-1 min-w-0"
                            title={`${item.monthName} ${item.year}: ${item.count} requests`}
                        >
                            {/* Count label */}
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                {item.count}
                            </span>

                            {/* Bar */}
                            <div className="w-full flex items-end justify-center" style={{ height: '140px' }}>
                                <div
                                    className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${isCurrentMonth
                                            ? 'bg-gradient-to-t from-buteak-gold to-yellow-400'
                                            : 'bg-gradient-to-t from-buteak-primary to-blue-400'
                                        }`}
                                    style={{
                                        height: `${Math.max(heightPercent, 5)}%`,
                                    }}
                                />
                            </div>

                            {/* Month label */}
                            <span className={`text-xs mt-2 ${isCurrentMonth
                                    ? 'font-bold text-buteak-gold'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {item.monthShort}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {data.reduce((sum, d) => sum + d.count, 0)}
                    </span>
                    {" "}total requests in last 12 months
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-buteak-primary"></div>
                        <span className="text-gray-500 dark:text-gray-400">Past months</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-buteak-gold"></div>
                        <span className="text-gray-500 dark:text-gray-400">Current month</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
