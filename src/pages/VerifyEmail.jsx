import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import backendurl from '@/utils/backendurl';

const STATUS = {
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  ERROR: 'error',
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(STATUS.VERIFYING);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus(STATUS.ERROR);
      return;
    }

    axios
      .get(`${backendurl}/user/auth/verify-email`, { params: { token } })
      .then(() => setStatus(STATUS.SUCCESS))
      .catch(() => setStatus(STATUS.ERROR));
  }, [searchParams]);

  const content = {
    [STATUS.VERIFYING]: {
      icon: (
        <svg className="ve-spinner" viewBox="0 0 50 50" aria-hidden="true">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
        </svg>
      ),
      title: 'Verifying your email',
      message: 'Just a moment while we confirm your address…',
      accent: '#6366f1',
    },
    [STATUS.SUCCESS]: {
      icon: (
        <svg viewBox="0 0 50 50" fill="none" aria-hidden="true">
          <circle cx="25" cy="25" r="22" stroke="#22c55e" strokeWidth="3" />
          <path
            d="M14 26l8 8 14-16"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ve-check"
          />
        </svg>
      ),
      title: 'Email verified!',
      message: 'Your address has been confirmed. You now have full access to your profile.',
      accent: '#22c55e',
    },
    [STATUS.ERROR]: {
      icon: (
        <svg viewBox="0 0 50 50" fill="none" aria-hidden="true">
          <circle cx="25" cy="25" r="22" stroke="#ef4444" strokeWidth="3" />
          <path
            d="M17 17l16 16M33 17L17 33"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            className="ve-cross"
          />
        </svg>
      ),
      title: 'Verification failed',
      message: 'This link is invalid or has expired. Please request a new verification email.',
      accent: '#ef4444',
    },
  };

  const { icon, title, message, accent } = content[status];

  return (
    <>
      <div className="ve-root" role="main">
        <div
          className="ve-card"
          role="status"
          aria-live="polite"
          aria-label={title}
          key={status}
        >
          <div className="ve-icon-wrap">{icon}</div>

          <h1 className="ve-title">{title}</h1>

          <p className="ve-message">
            {message}
            {status === STATUS.VERIFYING && (
              <>
                {' '}
                <span aria-hidden="true">
                  <span className="ve-dot" style={{ background: accent }} />
                  <span className="ve-dot" style={{ background: accent }} />
                  <span className="ve-dot" style={{ background: accent }} />
                </span>
              </>
            )}
          </p>

          {status === STATUS.SUCCESS && (
            <div className="ve-actions">
              <a href="/dashboard" className="ve-btn ve-btn-primary">
                Go to Dashboard
              </a>
            </div>
          )}

          {status === STATUS.ERROR && (
            <div className="ve-actions">
              <a href="/resend-verification" className="ve-btn ve-btn-primary">
                Resend verification email
              </a>
              <a href="/login" className="ve-btn ve-btn-ghost">
                Back to login
              </a>
            </div>
          )}

          <hr className="ve-rule" />
          <p className="ve-footer">
            Need help?{' '}
            <a href="/support">Contact support</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;