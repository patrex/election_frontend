import { useState, useEffect, useRef } from 'react';

// =================================================================
// OTPVerification MODAL Component (Handles OTP input/resend)
// =================================================================
/**
 * OTPVerification Component
 * (Handles the modal view, OTP input, timer, and verification API call)
 * @param {Object} props
 * @param {string} props.destination - The phone number (or email) to send OTP to
 * @param {string} props.redirectUrl - URL to redirect after successful verification
 * @param {Function} props.onSuccess - Callback after successful verification
 * @param {Function} props.onCancel - Callback when user cancels
 * @param {Function} props.sendOtpApi - Function to send OTP (should return Promise)
 * @param {Function} props.verifyOtpApi - Function to verify OTP (should return Promise with success boolean)
 */
const OTPVerification = ({
    destination,
    redirectUrl,
    onSuccess,
    onCancel,
    sendOtpApi,
    verifyOtpApi
}) => {
    const [otpValue, setOtpValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const timerRef = useRef(null);

    // --- Timer Logic ---
    useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
        } else if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        return () => clearTimeout(timerRef.current);
    }, [resendTimer]);

    // --- Auto Send OTP on Mount ---
    // The code is sent automatically when the modal is mounted (i.e., when step is set to 'otp')
    useEffect(() => {
        handleSendOtp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startTimer = () => {
        setResendTimer(60); // Start a 60-second timer
    };

    const handleSendOtp = async () => {
        if (resendTimer > 0 && isSent) return;

        setIsLoading(true);
        setError('');
        try {
            await sendOtpApi(destination); // Use destination
            setIsSent(true);
            startTimer();
        } catch (err) {
            setError(err.message || 'Failed to send code. Please ensure the destination is correct.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpValue.length < 4) {
            setError('Please enter the 4-6 digit code.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await verifyOtpApi(destination, otpValue);

            if (result && result.success) {
                setIsVerified(true);
                // Delay redirection slightly to show success state
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(result);
                    }
                    if (redirectUrl) {
                        window.location.href = redirectUrl; 
                    }
                }, 1000);
            } else {
                setError(result?.message || 'Invalid verification code. Try again.');
            }
        } catch (err) {
            setError(err.message || 'Verification failed due to an error.');
        } finally {
            if (!isVerified) {
                setIsLoading(false);
            }
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    // Calculate dynamic button state
    const isVerifyDisabled = isLoading || otpValue.length < 4 || isVerified;
    const isResendDisabled = isLoading || resendTimer > 0 || isVerified;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100 ease-out duration-300">
                
                {/* Close Button (Top Right) */}
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal Header */}
                <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isVerified ? (
                             <svg className="w-8 h-8 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                        ) : (
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isVerified ? 'Verification Successful!' : 'Enter Verification Code'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {isSent ? `Code sent to: ${destination}` : 'Sending verification code...'}
                    </p>
                </div>

                {/* Success Message / Error Message */}
                {isVerified ? (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center font-medium">
                        Redirecting you shortly...
                    </div>
                ) : (
                    error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )
                )}

                {/* OTP Input */}
                {!isVerified && (
                    <div className="mb-6">
                        <label
                            htmlFor="otp-input"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Verification Code
                        </label>
                        <input
                            type="tel" // Use tel for better mobile keyboard experience
                            id="otp-input"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                            placeholder="• • • • • •"
                            maxLength="6"
                            className="w-full px-4 py-3 text-center text-3xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white shadow-inner transition"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>
                )}

                {/* Action Buttons */}
                {!isVerified && (
                    <>
                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={handleVerifyOtp}
                                disabled={isVerifyDisabled}
                                className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Verify'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Resend Link with Timer */}
                        <div className="mt-2 text-center">
                            <button
                                onClick={handleSendOtp}
                                disabled={isResendDisabled}
                                className={`text-sm font-medium transition-colors disabled:opacity-50 ${isResendDisabled ? 'text-gray-500' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                {resendTimer > 0 ? (
                                    `Resend code in ${resendTimer}s`
                                ) : (
                                    'Didn\'t receive code? Resend now'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// =================================================================
// App Component (Handles the initial input and flow state)
// =================================================================

const OTPService = () => {
    const [step, setStep] = useState('input'); // 'input', 'otp', 'success'
    const [destination, setDestination] = useState(''); // Email or Phone (normalized)
    const [inputError, setInputError] = useState('');
    const [status, setStatus] = useState('Awaiting Input');

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Helper function to check if the input is a valid Nigerian phone format
    const isNigerianPhone = (input) => {
        // Simple check for numbers starting with +234, 234, or 0, followed by 10 digits
        const cleanInput = input.replace(/\D/g, '');
        
        // Matches +234XXXXXXXXXX (14 digits including '+') or 234XXXXXXXXXX (13 digits) 
        // or 0XXXXXXXXXX (11 digits)
        if ((cleanInput.length === 13 && cleanInput.startsWith('234')) || 
            (cleanInput.length === 11 && cleanInput.startsWith('0'))) {
             return true;
        }
        // Also allow the international format starting with '+' if it has the correct length
        if (input.startsWith('+234') && input.replace(/\D/g, '').length === 13) {
            return true;
        }
        
        return false;
    };

    // Helper function to normalize Nigerian phone numbers to E.164 format (+234...)
    const normalizeNigerianPhone = (input) => {
        const cleanInput = input.replace(/\D/g, '');
        if (cleanInput.startsWith('0') && cleanInput.length === 11) {
            // Converts 080... to +23480...
            return `234${cleanInput.substring(1)}`;
        }
        if (cleanInput.startsWith('234') && cleanInput.length === 13) {
            // Converts 23480... to +23480...
             return `${cleanInput}`;
        }
        if (input.startsWith('+234')) {
            return + input.replace(/\D/g, '').replace(/^0/, '234');
        }

        return input; // Return original if format is unexpected
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setInputError('');

        let cleanedInput = destination.trim();

        if (EMAIL_REGEX.test(cleanedInput)) {
            // Input is an email
            setDestination(cleanedInput);
            setStep('otp');
        } else if (isNigerianPhone(cleanedInput)) {
            // Input is a Nigerian phone number
            const normalizedPhone = normalizeNigerianPhone(cleanedInput);
            setDestination(normalizedPhone);
            setStep('otp');
        } else {
            setInputError('Please enter a valid email address or a Nigerian phone number (e.g., 080xxxxxxxx, or +234xxxxxxxxxx).');
            return;
        }
    };

    const handleSuccess = (result) => {
        setStatus(`SUCCESS: Verification complete.`);
        setStep('success');
        // In a real app, you'd store the result.token here.
        console.log('Verification Success Token:', result.token);
    };

    const handleCancel = () => {
        setStep('input');
        setDestination('');
        setStatus('Verification cancelled. Awaiting Input.');
    };

    // --- Mock API functions ---
    const sendOtpApi = async (destination) => {
        setStatus(`Sending OTP to ${destination}...`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.1) {
                    reject(new Error('Rate limit exceeded. Try again in 60s.'));
                } else {
                    setStatus(`Code sent to ${destination}. Ready for verification.`);
                    resolve({ success: true });
                }
            }, 1200);
        });
    };

    const verifyOtpApi = async (destination, otp) => {
        setStatus(`Verifying OTP: ${otp}...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (otp === '123456') {
                    resolve({ success: true, token: 'validated_user_session_xyz' });
                } else {
                    resolve({ success: false, message: 'Invalid code' });
                }
            }, 1000);
        });
    };
    // --- End Mock API functions ---

    const InputForm = () => (
        <form onSubmit={handleInitialSubmit} className="space-y-6">
             <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Start Verification
            </h2>
            <p className="text-gray-600 text-sm mb-6 text-center">
                Please enter your email or Nigerian phone number to receive your code.
            </p>
            <div>
                <label htmlFor="destination-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Phone Number
                </label>
                <input
                    type="text"
                    id="destination-input"
                    value={destination}
                    onChange={(e) => {
                        setDestination(e.target.value);
                        setInputError(''); // Clear error on change
                    }}
                    placeholder="e.g., user@example.com or 080xxxxxxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    autoFocus
                />
                {inputError && (
                    <p className="mt-2 text-sm text-red-600">{inputError}</p>
                )}
            </div>
            <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={!destination.trim()}
            >
                Send Verification Code
            </button>
        </form>
    );

    const SuccessMessage = () => (
        <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
            <p className="text-gray-600 mb-6">
                Your identity has been successfully verified. You can now proceed to the next step.
            </p>
            <button
                onClick={() => { setStep('input'); setDestination(''); }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
                Start Over
            </button>
        </div>
    );


    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans flex flex-col items-center justify-center">
            <div className="max-w-3xl mx-auto w-full">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
                    Secure Enrollment Flow
                </h1>

                <div className="bg-white rounded-xl p-8 shadow-xl mb-6 max-w-lg mx-auto">
                    {step === 'input' && <InputForm />}
                    {step === 'success' && <SuccessMessage />}
                    
                    {step !== 'success' && (
                        <p className="mt-8 text-sm font-medium text-gray-500 text-center border-t pt-4">
                            App Status: <span className={`font-semibold ${status.includes('Sent') ? 'text-blue-600' : status.includes('SUCCESS') ? 'text-green-600' : 'text-gray-900'}`}>{status}</span>
                        </p>
                    )}
                </div>

            </div>

            {/* OTP Modal Render */}
            {step === 'otp' && (
                <OTPVerification
                    destination={destination}
                    redirectUrl="/success-page"
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    sendOtpApi={sendOtpApi}
                    verifyOtpApi={verifyOtpApi}
                />
            )}
        </div>
    );
};

export default OTPService;