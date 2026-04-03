"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { ScanningLoader } from "@/components/ui/scanning-loader";
import { ResultsView } from "@/components/ui/results-view";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [careerLevel, setCareerLevel] = useState<string>("Fresh");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Restore results from session storage if they exist
    const savedResults = sessionStorage.getItem("cvAnalysisResults");
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setAnalysisResults(parsed);
        setShowResults(true);
      } catch (e) {
        sessionStorage.removeItem("cvAnalysisResults");
      }
    }

    // Check active sessions and sets the user
    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data?.user || null;
      setUser(currentUser);
      
      // Save pending results to DB if coming back from login
      if (currentUser) {
        const pendingSave = sessionStorage.getItem("pendingDbSave");
        const savedResults = sessionStorage.getItem("cvAnalysisResults");
        const savedCareerLevel = sessionStorage.getItem("cvCareerLevel") || "Unknown";
        if (pendingSave === "true" && savedResults) {
          try {
            const parsed = JSON.parse(savedResults);
            supabase.from("cv_reviews").insert([{
              user_id: currentUser.id,
              career_level: savedCareerLevel,
              analysis_result: parsed,
            }]).then(({ error }) => {
              if (!error) {
                sessionStorage.removeItem("pendingDbSave");
                sessionStorage.removeItem("cvCareerLevel");
              }
            });
          } catch (e) {
            console.error("Error saving pending results", e);
          }
        }
      }
    });

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (showResults) {
      const isConfirmed = window.confirm("Are you sure you want to log out? You will be redirected to the login page and lose your current analysis results.");
      if (!isConfirmed) return;
    }

    await supabase.auth.signOut();
    sessionStorage.removeItem("cvAnalysisResults");
    
    if (showResults) {
      setShowResults(false);
      setAnalysisResults(null);
      setFile(null);
      router.push("/login");
    }
  };

  const analyzeCV = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setAnalysisResults(null);

    const formData = new FormData();
    formData.append("cv", file);
    formData.append("careerLevel", careerLevel);

    try {
      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed.");
      }

      const resultData = await response.json();
      setAnalysisResults(resultData);
      sessionStorage.setItem("cvAnalysisResults", JSON.stringify(resultData));
      sessionStorage.setItem("cvCareerLevel", careerLevel);

      if (!user) {
        setIsAnalyzing(false);
        sessionStorage.setItem("pendingDbSave", "true");
        router.push("/login");
        return;
      }

      // Save to Supabase DB if user is logged in
      if (user) {
        try {
          const { error: dbError } = await supabase
            .from("cv_reviews")
            .insert([
              {
                user_id: user.id,
                career_level: careerLevel,
                analysis_result: resultData,
              }
            ]);
            
          if (dbError) {
            console.error("Error saving review to database:", dbError);
          }
        } catch (err) {
          console.error("Exception saving to database:", err);
        }
      }

      setIsAnalyzing(false);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error analyzing CV:", error);
      setIsAnalyzing(false);
      // In a real app, handle error UI here
      alert("Something went wrong while analyzing the CV. Please try again.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx")) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Account for the sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleLogoClick = () => {
    sessionStorage.removeItem("cvAnalysisResults");
    setShowResults(false);
    setAnalysisResults(null);
    setFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradientAnimation>
        <div className="relative z-50 flex flex-col min-h-screen">
          {/* Navigation Header */}
          <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-md border-b border-white/20">
            <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2">
                <Image
                  src="/Logo.png"
                  alt="CareerPilot Logo"
                  width={240}
                  height={60}
                  className="h-14 w-auto object-contain cursor-pointer"
                />
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <a 
                  href="#how-it-works" 
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
                >
                  How it Works
                </a>
                <a 
                  href="#pricing" 
                  onClick={(e) => scrollToSection(e, 'pricing')}
                  className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
                >
                  Pricing
                </a>
                <a 
                  href="#contact-us" 
                  onClick={(e) => scrollToSection(e, 'contact-us')}
                  className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
                >
                  Contact Us
                </a>
              </div>

              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium hidden sm:block">Hi, {user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition cursor-pointer">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-full font-medium transition border border-red-200">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition shadow-md inline-block">
                  Login / Sign Up
                </Link>
              )}
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full px-6 py-16 md:py-24">
            <AnimatePresence mode="wait">
              {!isAnalyzing && !showResults && (
                <motion.div 
                  key="landing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Hero Section - Centered Content Only */}
                  <div className="relative max-w-4xl mx-auto mb-16 text-center flex flex-col items-center gap-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Free detailed CV review for
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  job seekers in the Middle East
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Get personalized feedback, scores, and insights tailored to your industry and location.
              </p>
            </div>

            {/* Upload Section */}
            <div className="max-w-7xl mx-auto">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition flex flex-col items-center ${
                  dragActive
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-gray-300 bg-white/40 backdrop-blur-sm hover:border-blue-400 hover:bg-white/60"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100/50 p-4 rounded-full">
                    <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-blue-600' : 'text-blue-500'}`} />
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-gray-900 font-semibold text-lg">
                    Drag & drop your file or click to browse
                  </p>
                </div>

                <p className="text-gray-500 text-sm">Supported formats: PDF, DOCX</p>

                {file && (
                  <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
                    <div className="p-4 bg-green-50/80 border border-green-200 rounded-xl backdrop-blur-sm flex items-center gap-3 w-full justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <p className="text-green-800 text-sm font-medium truncate">File selected: <span className="font-semibold">{file.name}</span></p>
                    </div>

                    <div className="w-full flex flex-col gap-2 text-left" onClick={(e) => e.stopPropagation()}>
                      <label className="text-sm font-semibold text-gray-700">Select your career level:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Fresh", "Mid", "Senior"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setCareerLevel(level)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition border ${
                              careerLevel === level 
                                ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                          >
                            {level === "Fresh" ? "Fresh (0-2 yrs)" : level === "Mid" ? "Mid (3-7 yrs)" : "Senior (8+ yrs)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        analyzeCV();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg hover:shadow-xl w-full transform hover:scale-105 mt-2"
                    >
                      Analyze CV
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleChange}
                  accept=".pdf,.docx"
                  className="hidden"
                />
              </div>
            </div>

            {/* Steps Section */}
            <div id="how-it-works" className="mt-32 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">How CareerPilot Works</h2>
                <p className="text-lg text-gray-600">Get your CV reviewed and improved in three simple steps.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-full aspect-video bg-blue-50/50 rounded-2xl mb-8 flex items-center justify-center overflow-hidden border border-blue-100/50 relative">
                    <video 
                      src="/Generated Video March 22, 2026 - 10_32AM.mp4" 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 shadow-md">1</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Your CV</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Securely upload your current CV in PDF or DOCX format. Our system accepts most standard document layouts.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-full aspect-video bg-purple-50/50 rounded-2xl mb-8 flex items-center justify-center overflow-hidden border border-purple-100/50 relative">
                    <video 
                      src="/Generated Video March 22, 2026 - 12_04PM.mp4" 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    />
                    <div className="absolute top-4 left-4 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 shadow-md">2</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Analysis</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our advanced AI scans your CV against industry standards, identifying strengths and areas for improvement.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-full aspect-video bg-orange-50/50 rounded-2xl mb-8 flex items-center justify-center overflow-hidden border border-orange-100/50 relative">
                    <video 
                      src="/Generated Video March 22, 2026 - 12_12PM.mp4" 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    />
                    <div className="absolute top-4 left-4 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 shadow-md">3</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Actionable Feedback</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive a detailed report with a score, tailored suggestions, and rewritten bullet points to boost your chances.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div id="contact-us" className="mt-32 w-full max-w-7xl mx-auto relative rounded-3xl overflow-hidden shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1),0_20px_40px_-15px_rgba(0,0,0,0.1)] bg-gray-100 min-h-[450px] md:min-h-[500px]">
              <Image 
                src="/Generated Image March 22, 2026 - 12_18PM (1).png" 
                alt="Support Team Background" 
                fill
                className="object-cover opacity-90"
                priority
              />
              
              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 bg-black/5">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 border border-white/50 shadow-2xl flex flex-col items-center text-center max-w-md w-full transform transition-all hover:scale-105">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">We're here for support</h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                    Have any questions or need help with your CV review? Our experts are ready to assist you.
                  </p>
                  <a href="mailto:info@careerpilot.com" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition shadow-lg hover:shadow-xl inline-block">
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
                </motion.div>
              )}
              {isAnalyzing && !showResults && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <ScanningLoader 
                    fileName={file?.name || "Document"} 
                    onComplete={() => {
                      // We don't change state here anymore. The analyzeCV function handles state transitions when the fetch completes.
                    }} 
                  />
                </motion.div>
              )}
              {showResults && analysisResults && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResultsView isLoggedIn={!!user} results={analysisResults} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="w-full bg-white/40 backdrop-blur-md border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start gap-2">
                <Link href="/" onClick={handleLogoClick}>
                  <Image
                    src="/Logo.png"
                    alt="CareerPilot Logo"
                    width={160}
                    height={40}
                    className="h-8 w-auto object-contain cursor-pointer"
                  />
                </Link>
                <a href="mailto:info@careerpilot.com" className="text-gray-500 hover:text-blue-600 transition text-sm font-medium mt-1">
                  info@careerpilot.com
                </a>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                © {new Date().getFullYear()} CareerPilot. All rights reserved.
              </p>
              <div className="flex gap-8">
                <a href="#" className="text-gray-500 hover:text-blue-600 transition text-sm font-medium">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition text-sm font-medium">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </BackgroundGradientAnimation>
    </div>
  );
}
