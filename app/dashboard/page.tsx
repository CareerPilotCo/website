"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { ArrowLeft, FileText, Calendar, ChevronRight, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndReviews = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        router.push("/login");
        return;
      }
      setUser(authData.user);

      // Fetch reviews from Supabase DB
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

  const viewReview = (review: any) => {
    // Store in session storage and redirect to home to view it
    sessionStorage.setItem("cvAnalysisResults", JSON.stringify(review.analysis_result));
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Header */}
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
            <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full font-medium transition text-sm">
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Saved Reviews</h1>
          <Link 
            href="/" 
            onClick={() => sessionStorage.removeItem("cvAnalysisResults")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition shadow-md"
          >
            New Review
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
                        {review.career_level} Level CV Review
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
      </main>
    </div>
  );
}
