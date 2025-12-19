import { useNavigate, Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/App';
import loginImg from '../assets/login_banner.svg';
import { authman } from '@/utils/fireloader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PulseLoader } from 'react-spinners';
import Toast from '@/utils/ToastMsg';
import VotelyLogo from '@/components/votelyLogo';

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithRedirect,
    signOut,
} from 'firebase/auth';

// Refined Input Style for reuse
const inputClasses = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200 
    bg-gray-50 dark:bg-gray-900 
    border-gray-200 dark:border-gray-800 
    focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none
    placeholder:text-gray-400 dark:placeholder:text-gray-600
    disabled:opacity-50 disabled:cursor-not-allowed
`;

function Login() {
    const navigate = useNavigate();
    const { setUser, user } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const provider = new GoogleAuthProvider();

    const schema = z.object({
        email: z.string().email('Invalid email').min(1, 'Required'),
        password: z.string().min(6, 'Min 6 characters'),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    useEffect(() => {
        if (user) navigate(`/user/${user.uid}`);
    }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithRedirect(authman, provider);
        } catch (error) {
            Toast.error('Google sign-in failed');
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);
        setError('');
        try {
            const res = await signInWithEmailAndPassword(authman, formData.email, formData.password);
            if (res.user.emailVerified) {
                setUser(res.user);
                Toast.success('Welcome back!');
                navigate(`/user/${res.user.uid}`);
            } else {
                Toast.warning('Please verify your email');
                await signOut(authman);
            }
        } catch (err) {
            const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Login failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-950 font-sans">
            {/* Left: Branding & Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-900/50 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-12 left-12">
                    <VotelyLogo size="120px" color="#6366f1" />
                </div>
                <div className="max-w-md text-center">
                    <img src={loginImg} alt="Login" className="w-full mb-8 animate-in fade-in zoom-in duration-700" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Secure. Private. Fast.</h2>
                    <p className="text-gray-500 mt-2">The most trusted way to cast your digital vote.</p>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <VotelyLogo size="100px" color="#6366f1" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Sign In
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your credentials to access Votely.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label>
                            <input 
                                {...register('email')}
                                className={inputClasses}
                                placeholder="name@company.com"
                                disabled={loading}
                            />
                            {errors.email && <span className="text-xs text-red-500 ml-1 mt-1">{errors.email.message}</span>}
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5 ml-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                                <Link to="/forgot-password" size="sm" className="text-xs text-violet-600 hover:text-violet-500 font-medium">Forgot?</Link>
                            </div>
                            <input 
                                type="password"
                                {...register('password')}
                                className={inputClasses}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            {errors.password && <span className="text-xs text-red-500 ml-1 mt-1">{errors.password.message}</span>}
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98] flex justify-center items-center">
                            {loading ? <PulseLoader color="#fff" size={6} /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-800"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-950 px-2 text-gray-400">Or continue with</span></div>
                    </div>

                    <button 
                        onClick={handleGoogleSignIn}
                        className="w-full py-3 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center gap-3 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <GoogleIcon /> {/* Modular SVG component */}
                        Google
                    </button>

                    <p className="mt-8 text-center text-gray-500 text-sm">
                        New to Votely? <Link to="/signup" className="text-violet-600 font-bold hover:underline">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Compact Google Icon component
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

export default Login;