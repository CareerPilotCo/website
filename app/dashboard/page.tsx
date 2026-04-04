"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FREE_REVIEW_LIMIT, getUserPlan, hasReachedFreeReviewLimit, isPremiumUser } from "@/lib/account";
import type { SavedReview } from "@/lib/types";
import { FileText, Calendar, ChevronRight, CheckCircle2, Crown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accountName, setAccountName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndReviews = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        router.push("/login");
        return;
      }

      setUser(authData.user);
      setAccountName(authData.user.user_metadata?.full_name || "");

      const { data, error } = await supabase
        .from("cv_reviews")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
      }

      setLoading(false);
    };

    fetchUserAndReviews();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleAccountNameSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = accountName.trim();
    if (!trimmedName) {
      setNameError("Please enter the name you want displayed on your account.");
      setNameMessage(null);
      return;
    }

    setIsSavingName(true);
    setNameError(null);
    setNameMessage(null);

    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user?.user_metadata,
        full_name: trimmedName,
      },
    });

    if (error) {
      setNameError(error.message || "We couldn't update your account name right now.");
    } else if (data.user) {
      setUser(data.user);
      setAccountName(data.user.user_metadata?.full_name || trimmedName);
      setNameMessage("Your account name has been updated.");
    }

    setIsSavingName(false);
  };

  const viewReview = (review: SavedReview) => {
    sessionStorage.setItem("cvAnalysisResults", JSON.stringify(review.analysis_result));
    router.push("/");
  };

  const plan = getUserPlan(user);
  const reviewLimitReached = hasReachedFreeReviewLimit(reviews.length, user);
  const freeReviewsRemaining = Math.max(FREE_REVIEW_LIMIT - reviews.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Logo.png"
              alt="CareerPilot Logo"
              width={200}
              height={50}
              className="h-10 w-auto object-contain cursor-pointer"
            />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium hidden sm:block">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <Link
              href="/pricing"
              className="hidden sm:inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Pricing
            </Link>
            <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full font-medium transition text-sm">
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <div className="flex flex-col gap-10">
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Account</p>
                  <h1 className="mt-2 text-3xl font-bold text-gray-900">Your Dashboard</h1>
                  <p className="mt-2 text-gray-600">
                    Update the name shown across your account and keep track of your review access.
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isPremiumUser(user)
                    ? "bg-amber-100 text-amber-900"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {isPremiumUser(user) ? <Crown className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {plan === "premium" ? "Premium" : "Free"}
                </div>
              </div>

              <form onSubmit={handleAccountNameSave} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="account-name" className="block text-sm font-semibold text-gray-700">
                    Account name
                  </label>
                  <input
                    id="account-name"
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Enter the name shown in your account"
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {nameError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {nameError}
                  </p>
                )}

                {nameMessage && (
                  <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {nameMessage}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={isSavingName}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingName ? "Saving..." : "Save account name"}
                  </button>
                  <p className="text-sm text-gray-500">
                    This name is used in your navigation, dashboard, and account identity.
                  </p>
                </div>
              </form>
            </div>

            <div className={`rounded-3xl border p-8 shadow-sm ${
              reviewLimitReached
                ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
                : "border-blue-200 bg-gradient-to-br from-blue-50 to-white"
            }`}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Review Access</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {plan === "premium" ? "Unlimited reviews unlocked" : "Your free review allowance"}
              </h2>
              <p className="mt-3 text-gray-600">
                {plan === "premium"
                  ? "Your account can keep generating new CV reviews without a cap."
                  : reviewLimitReached
                    ? "You have already used your free review. Upgrade to premium to create additional CV reviews."
                    : `You have used ${reviews.length} of ${FREE_REVIEW_LIMIT} free review${FREE_REVIEW_LIMIT === 1 ? "" : "s"}.`}
              </p>

              <div className="mt-6 rounded-2xl border border-white/70 bg-white/80 p-5">
                <p className="text-sm text-gray-500">Current status</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {plan === "premium" ? "Unlimited" : `${freeReviewsRemaining} remaining`}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {plan === "premium"
                    ? "Premium members can save as many CV reviews as they need."
                    : "Premium also unlocks ongoing review history and a stronger upsell path for coaching."}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={reviewLimitReached ? "/pricing" : "/"}
                  onClick={() => {
                    if (!reviewLimitReached) {
                      sessionStorage.removeItem("cvAnalysisResults");
                    }
                  }}
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    reviewLimitReached
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {reviewLimitReached ? "Upgrade to Premium" : "Start a New Review"}
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Saved Reviews</h2>
                <p className="mt-2 text-gray-600">
                  Revisit earlier analyses, scores, and recommendations anytime.
                </p>
              </div>
              <Link
                href={reviewLimitReached ? "/pricing" : "/"}
                onClick={() => {
                  if (!reviewLimitReached) {
                    sessionStorage.removeItem("cvAnalysisResults");
                  }
                }}
                className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  reviewLimitReached
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    : "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                }`}
              >
                {reviewLimitReached ? "Upgrade for More Reviews" : "New Review"}
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-12 rounded-3xl border border-gray-200 shadow-sm text-center"
              >
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-6">Upload your CV to get your first professional AI analysis.</p>
                <Link
                  href="/"
                  onClick={() => sessionStorage.removeItem("cvAnalysisResults")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition inline-block"
                >
                  Analyze a CV
                </Link>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {reviews.map((review) => {
                  const result = review.analysis_result?.data;
                  const candidateName = typeof result?.candidate_name === "string"
                    ? result.candidate_name.trim()
                    : "";
                  const date = new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => viewReview(review)}
                      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          result?.verdict === "Keep" ? "bg-green-100 text-green-700" :
                          result?.verdict === "Maybe" ? "bg-blue-100 text-blue-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            {candidateName ? `${candidateName}'s CV Review` : `${review.career_level} Level CV Review`}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              result?.verdict === "Keep" ? "bg-green-100 text-green-700" :
                              result?.verdict === "Maybe" ? "bg-blue-100 text-blue-700" :
                              "bg-orange-100 text-orange-700"
                            }`}>
                              {result?.verdict || "Reviewed"}
                            </span>
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {date}</span>
                            <span>•</span>
                            <span className="font-medium text-gray-700">Score: {result?.total_score || 0}/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button className="text-gray-400 hover:text-blue-600 transition p-2 bg-gray-50 hover:bg-blue-50 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
