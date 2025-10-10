'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';
import AnimatedBackground from '@/components/AnimatedBackground';
import { ArrowRightIcon, KeyIcon, UserIcon } from '@heroicons/react/24/solid';

const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

    useEffect(() => {
      setIsLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
        setIsLoading(false);
    }, [router]);
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') {
      setError('Please enter your username.');
      return;
    }
    // Optional: Check if user exists
    setIsLoading(true);
    try {
        // you can add a check here to see if user exists
        // for now we will just move to next step
        setError('');
        setStep(2);
    } catch (err) {
        setError('User not found.');
    }
    setIsLoading(false);

  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '') {
      setError('Please enter your password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.accessToken);
        router.push('/dashboard');
      }
    } catch (err: any) {
        if (err.response) {
            setError(err.response.data.message || 'Login failed. Please check your credentials.');
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    }
    setIsLoading(false);
  };

  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-primary text-neutral-base p-6">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-support/30 bg-neutral-darker-gray/80 p-8 shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-1 text-center text-2xl font-heading text-white drop-shadow">Welcome Back!</h2>
                <p className="mb-6 text-center text-white/80 drop-shadow-sm">Let's get you signed in.</p>
                <form onSubmit={handleUsernameSubmit}>
                  <div className="mb-4">
                    <div className="input-border-animated">
                      <div className="input-border-animated__inner">
                        <UserIcon className="h-5 w-5 text-support" />
                        <input
                          type="text" 
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="flex-1 bg-transparent text-white placeholder:text-support/60 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-heading text-white drop-shadow">Welcome, {username}!</h2>
                    <p className="text-white/80 drop-shadow-sm">Enter your password to continue.</p>
                </div>
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-4">
                    <div className="input-border-animated">
                      <div className="input-border-animated__inner">
                        <KeyIcon className="h-5 w-5 text-support" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex-1 bg-transparent text-white placeholder:text-support/60 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                <button onClick={() => setStep(1)} className="mt-4 text-sm text-support hover:underline">
                    Not {username}? Go back.
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
