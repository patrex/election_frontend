import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import loginImg from '../assets/login_banner.svg';
import { authman } from '@/utils/fireloader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PulseLoader } from 'react-spinners';
import Toast from '@/utils/ToastMsg';
import { useAuth } from '@/contexts/AuthContext';

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithRedirect,
} from 'firebase/auth';

// ---------------------------------------------------------------------------
// Shared input style — extracted so any future inputs stay consistent
// ---------------------------------------------------------------------------
const inputClasses = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200
    bg-gray-50 dark:bg-gray-900
    border-gray-200 dark:border-gray-800
    text-gray-900 dark:text-white
    focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none
    placeholder:text-gray-400 dark:placeholder:text-gray-600
    disabled:opacity-50 disabled:cursor-not-allowed
`;

// Validation schema — kept outside component so it's not recreated each render
const schema = z.object({
    email: z.string().email('Invalid email').min(1, 'Required'),
    password: z.string().min(6, 'Min 6 characters'),
});

function Login() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ---------------------------------------------------------------------------
    // Nice-to-have: password visibility toggle state
    // ---------------------------------------------------------------------------
    const [showPassword, setShowPassword] = useState(false);

    const provider = new GoogleAuthProvider();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    // Redirect already-authenticated users immediately
    useEffect(() => {
        if (user) navigate(`/user/${user.uid}`);
    }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithRedirect(authman, provider);
        } catch {
            Toast.error('Google sign-in failed');
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);
        setError('');
        try {
            const loggedInUser = await login(formData);
            if (!loggedInUser) return;

            if (loggedInUser.verified) {
                navigate(`/user/${loggedInUser.id}`);
            } else {
                navigate('/user/verifymail');
            }
        } catch {
            // Errors are surfaced via the Toast / error state from login()
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-950 font-sans">

            {/* ----------------------------------------------------------------
                Left panel — branding & illustration (desktop only)
            ---------------------------------------------------------------- */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-900/50 items-center justify-center p-12 relative overflow-hidden">
                <div className="max-w-md text-center">
                    <img
                        src={loginImg}
                        alt="Voting illustration"
                        className="w-full mb-8 animate-in fade-in zoom-in duration-700"
                    />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Secure. Private. Fast.
                    </h2>
                    <p className="text-gray-500 mt-2">
                        The most trusted way to cast your digital vote.
                    </p>
                </div>
            </div>

            {/* ----------------------------------------------------------------
                Right panel — login form
                animate-in / slide-in-from-right: Tailwind v3 `@tailwindcss/animate`
                or shadcn's built-in animate utilities. Remove if not in project.
            ---------------------------------------------------------------- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Header */}
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Sign In
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Enter your credentials to access Voteng
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>

                        {/* Email field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                                className={inputClasses}
                                placeholder="name@company.com"
                                disabled={loading}
                            />
                            {errors.email && (
                                <span className="text-xs text-red-500 mt-1 block">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        {/* Password field with visibility toggle */}
                        <div style={{ marginBottom: '8px' }}>
                            {/* FIX: added items-center so "Forgot?" link is vertically
                                centred against the label instead of sitting at the top */}
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-violet-600 hover:text-violet-500 font-medium transition-colors"
                                >
                                    Forgot?
                                </Link>
                            </div>

                            {/* Nice-to-have: wrapper gives us a position anchor for the eye icon */}
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    {...register('password')}
                                    // FIX: extra right padding so text never slides under the icon
                                    className={`${inputClasses} pr-11`}
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                {/* Toggle button — purely presentational, so type="button"
                                    prevents accidental form submission */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    tabIndex={-1} // keep tab flow on the input itself
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>

                            {errors.password && (
                                <span className="text-xs text-red-500 ml-1 mt-1 block">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>

                        {/* Inline error banner — shown only when there's a server-side error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* FIX: unified button height with the Google button below via
                            the same py-3 / rounded-xl / font-bold pattern */}
                        {/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="Button violet text-center"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<PulseLoader color="currentColor" size={8} />
								</span>
							) : (
								'Sign in'
							)}
						</button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-950 px-2 text-gray-400 tracking-wider">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google sign-in
                        FIX: matched height (py-3 / min-h-[48px]) and border-radius
                        to the primary button above so the two buttons align perfectly */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        aria-label="Sign in with Google"
                        className="
                            w-full py-3 px-4 min-h-[48px]
                            bg-white dark:bg-gray-900
                            border border-gray-200 dark:border-gray-800
                            rounded-xl
                            flex items-center justify-center gap-3
                            font-semibold text-gray-700 dark:text-gray-200
                            hover:bg-gray-50 dark:hover:bg-gray-800
                            transition-all duration-150 active:scale-[0.98]
                            disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                        "
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    {/* Footer link */}
                    <p className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        New to Voteng?{' '}
                        <Link
                            to="/signup"
                            className="text-violet-600 font-bold hover:underline hover:text-violet-500 transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Icon components — kept inline & lightweight (no icon library dependency)
// ---------------------------------------------------------------------------

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

// Eye icons for password toggle
const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

export default Login;