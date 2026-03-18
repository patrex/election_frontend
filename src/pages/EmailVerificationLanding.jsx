import React, { useState } from 'react';
import { MailOpen, ArrowRight, RefreshCcw, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const EmailVerificationLanding = ({ userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with your actual API endpoint
      await axios.post('/api/auth/resend-verification', { email: userEmail });
      setResent(true);
    } catch (err) {
      setError('Could not resend email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        
        {/* Icon Header */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-blue-50 rounded-full">
            <MailOpen className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Messaging */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Verify your email
        </h1>
        <p className="text-slate-600 mb-8">
          We've sent a verification link to <span className="font-semibold text-slate-800">{userEmail}</span>. 
          Please check your inbox to activate your account.
        </p>

        {/* Success/Error States */}
        {resent && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            New verification link sent successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => window.open('https://mail.google.com', '_blank')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            Open Mail App <ArrowRight className="w-4 h-4" />
          </button>

          <button 
            onClick={handleResend}
            disabled={loading || resent}
            className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        {/* Footer Help */}
        <p className="mt-8 text-sm text-slate-400">
          Can't find it? Check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationLanding;