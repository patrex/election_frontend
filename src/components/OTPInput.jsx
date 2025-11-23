import { useState, useEffect, useRef } from 'react';

// The OTPInput component remains the same as it handles the best UX for multi-digit entry.
const OTPInput = ({ length = 6, onChange, onComplete }) => {
    const [otp, setOTP] = useState(new Array(length).fill(''));
    const inputRefs = useRef([]);

    // Update parent state whenever OTP digits change
    useEffect(() => {
        onChange(otp.join(''));
    }, [otp, onChange]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOTP = [...otp];
        newOTP[index] = value.substring(value.length - 1);
        setOTP(newOTP);

        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        const otpString = newOTP.join('');
        if (otpString.length === length) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else if (otp[index]) {
                const newOTP = [...otp];
                newOTP[index] = '';
                setOTP(newOTP);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        const newOTP = [...otp];
        
        for (let i = 0; i < length; i++) {
            newOTP[i] = pastedData[i] || '';
        }
        
        setOTP(newOTP);
        
        const nextIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        
        if (pastedData.length === length) {
            onComplete(newOTP.join(''));
        }
    };

    return (
        <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="tel" 
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    aria-label={`OTP Digit ${index + 1}`}
                    className="w-10 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                />
            ))}
        </div>
    );
};

export default OTPInput;