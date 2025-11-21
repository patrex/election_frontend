import { useState,} from 'react'

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
                Please enter your email phone number to receive your verification code.
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
             <div className="w-full">
                <button
                    type="submit"
                    className="w-2/3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={!destination.trim()}
                >
                    Send Verification Code
                </button>
            </div>
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
                    We need to verify you
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