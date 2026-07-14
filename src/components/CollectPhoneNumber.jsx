import { useState, useEffect, useCallback } from "react";
import { Loader2, Phone, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";


const PHONE_REGEX = /^[0-9]{11,15}$/;

function validate(value) {
    if (!value.trim()) return "Phone number is required.";
    if (!PHONE_REGEX.test(value.replace(/\s+/g, ""))) return "Enter a valid phone number.";
    return null;
}

const PhoneInputModal = ({ isOpen, onClose, prefill, onSubmit }) => {
    const [phoneNumber, setPhoneNumber] = useState(prefill ?? "");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { setVoter } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setPhoneNumber(phoneNumber ?? "");
            setError(null);
            setLoading(false);
        }
    }, [isOpen, prefill]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => e.key === "Escape" && handleClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        if (loading) return;
        onClose();
    }, [loading, onClose]);

    const handleChange = (e) => {
        setPhoneNumber(e.target.value);
        if (error) setError(validate(e.target.value));
    };

    const handleSubmit = async () => {
        const err = validate(phoneNumber);
        if (err) return setError(err);

        setLoading(true);
        setError(null);
        try {
            await onSubmit(phoneNumber);
            onClose();
        } catch (e) {
            setError(e?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <button
                    onClick={handleClose}
                    disabled={loading}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 disabled:opacity-40"
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="mb-5">
                    <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                        Phone Verification
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Enter your phone number to register as a voter.
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="modal-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone number
                    </label>

                    <div className="relative">
                        <Phone className="absolute pr-10 left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                        <input
                            id="modal-phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={handleChange}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="e.g. 08012345678"
                            autoFocus
                            disabled={loading}
                            className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border outline-none transition focus:ring-2 disabled:opacity-50 ${error
                                    ? "border-red-400 focus:ring-red-300"
                                    : "border-gray-300 focus:ring-indigo-500"
                            }`}
                        />
                    </div>

                    <p className="min-h-[16px] text-xs text-red-500">{error ?? ""}</p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="mt-2 w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-40"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Working...
                        </>
                    ) : (
                        "Submit"
                    )}
                </button>

                <p className="mt-3 text-xs text-gray-400 text-center">
                    *Standard SMS rates may apply
                </p>
            </div>
        </div>
    );
};

export default PhoneInputModal;