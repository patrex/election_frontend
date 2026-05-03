import { useState, useEffect, useCallback } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(value) {
    if (!value.trim()) return "Email is required.";
    if (!EMAIL_REGEX.test(value)) return "Enter a valid email address.";
    return null;
}

/**
 * EmailCollectorModal
 *
 * Props:
 *   isOpen   {boolean}          - controls visibility
 *   onClose  {() => void}       - called when modal should close
 *   onSubmit {(email) => Promise<void>} - receives the email, should throw on failure
 *   title    {string}           - optional modal heading
 *   subtitle {string}           - optional supporting copy
 */
export default function CollectEmailModal({
    isOpen,
    onClose,
    onSubmit,
    title = "Enter your email to receive your OTP via email",
    subtitle = "We'll not share your email with third parties",
}) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset form state whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setEmail("");
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => e.key === "Escape" && handleClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        if (loading) return; // prevent close mid-submit
        onClose();
    }, [loading, onClose]);

    const handleChange = (e) => {
        setEmail(e.target.value);
        // Re-validate on change only after a failed attempt
        if (error) setError(validate(e.target.value));
    };

    const handleSubmit = async () => {
        const err = validate(email);
        if (err) return setError(err);

        setLoading(true);
        setError(null);
        try {
            await onSubmit(email);
            onClose(); // parent closes modal on success
        } catch (e) {
            setError(e?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={handleClose}
        >
            {/* Modal panel — stop propagation so clicks inside don't close */}
            <div
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    disabled={loading}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="mb-5">
                    <h2
                        id="modal-title"
                        className="text-xl font-semibold text-gray-900"
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>

                {/* Email field */}
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="modal-email"
                        className="text-sm font-medium text-gray-700"
                    >
                        Email address
                    </label>

                    <div className="flex gap-2">
                        <input
                            id="modal-email"
                            type="email"
                            value={email}
                            onChange={handleChange}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="you@example.com"
                            autoComplete="email"
                            autoFocus
                            disabled={loading}
                            className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-black disabled:opacity-50 ${error
                                    ? "border-red-400 focus:ring-red-300"
                                    : "border-gray-300"
                                }`}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 disabled:opacity-40"
                        >
                            {loading ? "Submitting…" : "Subscribe"}
                        </button>
                    </div>

                    {/* Error message — always reserved in layout to prevent jump */}
                    <p className="min-h-[16px] text-xs text-red-500">
                        {error ?? ""}
                    </p>
                </div>
            </div>
        </div>
    );
}