"use client";

export function ChatMessage({ message, isUser, timestamp }) {
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isUser) {
        return (
            <div className="flex items-start gap-3 mb-4 justify-end animate-fadeIn">
                <div className="flex flex-col items-end max-w-[70%]">
                    <div className="bg-gradient-to-r from-buteak-primary to-buteak-gold text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-elevation-2">
                        <p className="text-sm md:text-base whitespace-pre-wrap break-words">{message}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(timestamp)}
                    </span>
                </div>

                {/* User Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-buteak-gold flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 mb-4 animate-fadeIn">
            {/* Bot Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-buteak-primary to-buteak-gold flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </div>

            <div className="flex flex-col max-w-[70%]">
                <div className="bg-gray-200 dark:bg-dark-surface-2 rounded-2xl rounded-tl-none px-4 py-3 shadow-elevation-1">
                    <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{message}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTime(timestamp)}
                </span>
            </div>
        </div>
    );
}
