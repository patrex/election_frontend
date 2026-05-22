import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

function ShowAlert({ show, onClose, status, title, message, actionLabel, onAction }) {
    if (!show) return null;

    const config = {
        success: { icon: <CheckCircle />, colorClass: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
        warning: { icon: <AlertTriangle />, colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
        error:   { icon: <XCircle />,       colorClass: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
    };

    const { icon, colorClass } = config[status] ?? config.error;
    const hasAction = status !== 'success' && onAction;

    return (
        <div className="fixed top-4 right-4 z-[200] w-80 max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:w-auto">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 flex flex-col gap-3">

                {/* Header row */}
                <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5 rounded"
                        aria-label="Dismiss"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Action row — only for non-success states */}
                {hasAction && (
                    <>
                        <div className="border-t border-gray-100 dark:border-gray-700" />
                        <div className="flex gap-2 pl-12">
                            <button
                                onClick={onAction}
                                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:opacity-80 transition flex items-center gap-1.5"
                            >
                                <RefreshCw size={13} />
                                {actionLabel ?? 'Retry'}
                            </button>
                            <button
                                onClick={onClose}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Dismiss
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default ShowAlert;