"use client";

export function StatCard({ title, value, icon, color = "blue", subtitle }) {
    const colorClasses = {
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
        red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    };

    return (
        <div className="bg-white dark:bg-dark-surface-2 rounded-xl shadow-elevation-2 p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-elevation-3">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
