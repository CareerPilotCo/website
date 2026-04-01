"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        
        // If Supabase returns a session immediately, it means email verification is disabled
        // We should just log them in and redirect
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMessage("Success! Please check your email to verify your account.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradientAnimation>
        <div className="relative z-50 flex flex-col min-h-screen items-center justify-center p-4">
          
          <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 hover:text-gray-900 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition hover:bg-white/60">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8"
          >
            <div className="flex justify-center mb-8">
              <Image src="/Logo.png" alt="CareerPilot Logo" width={200} height={50} className="h-10 w-auto object-contain" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-gray-500 text-center mb-8">
              {isSignUp ? "Sign up to save your CV reviews" : "Log in to access your dashboard"}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/50 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/50 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
              <span className="text-xs text-center text-gray-500 uppercase font-semibold">Or continue with</span>
              <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-6 w-full flex justify-center items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium transition shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {isSignUp ? "Log in" : "Sign up"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </BackgroundGradientAnimation>
    </div>
  );
}