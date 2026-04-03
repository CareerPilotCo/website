"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, FileText, CheckCircle2, AlertCircle, MessageSquare, Send, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ResultsViewProps {
  isLoggedIn?: boolean;
  results?: any;
}

export function ResultsView({ isLoggedIn = false, results }: ResultsViewProps) {
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      setHasGivenFeedback(true);
    }
  };

  // If the result is an error, show it
  if (results?.type === "error") {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-200 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p>{results.error_message}</p>
        </div>
      </div>
    );
  }

  const data = results?.data;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-4">
          <CheckCircle2 className="w-4 h-4" />
          Analysis Complete
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your CV Review Results</h2>
        <p className="text-xl text-gray-600">Here is our AI-powered feedback to help you land your dream job.</p>
      </motion.div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Section 1: Executive Summary (Always visible) */}
        <div className="p-8 md:p-12 border-b border-gray-100 bg-gradient-to-br from-blue-50/50 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">1</div>
            <h3 className="text-2xl font-bold text-gray-900">Executive Summary</h3>
          </div>
          
          <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
            {data?.executive_summary && (
              <p>{data.executive_summary}</p>
            )}
            {data?.verdict && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-900 block mb-1">Overall readiness: {data.verdict}</strong>
                  <span className="text-orange-800">{data.verdict_reason}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Content */}
          <div className="p-8 md:p-12 space-y-12">
            
            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">2</div>
                <h3 className="text-2xl font-bold text-gray-900">Section Presence & Score Table</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-sm">
                      <th className="p-4 rounded-tl-xl">Section</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 rounded-tr-xl text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {data?.sections?.map((section: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="p-4 font-medium">{section.name}</td>
                        <td className={`p-4 font-medium ${
                          section.status === 'Strong' ? 'text-green-600' :
                          section.status === 'Acceptable' ? 'text-blue-600' :
                          section.status === 'Needs Work' ? 'text-orange-600' : 'text-red-600'
                        }`}>{section.status}</td>
                        <td className="p-4 text-right font-semibold">{section.score} / {section.max_score}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <td colSpan={2} className="p-4 font-bold text-gray-900">Total Score</td>
                      <td className="p-4 text-right font-bold text-xl text-blue-600">{data?.total_score || 0} / 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">3</div>
                <h3 className="text-2xl font-bold text-gray-900">Detailed Section-by-Section Review</h3>
              </div>
              
              <div className="space-y-8">
                {data?.sections?.map((section: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      {section.name} 
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          section.status === 'Strong' ? 'bg-green-100 text-green-700' :
                          section.status === 'Acceptable' ? 'bg-blue-100 text-blue-700' :
                          section.status === 'Needs Work' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {section.status}
                      </span>
                    </h4>
                    {section.findings?.length > 0 ? (
                      <div className="space-y-4">
                        {section.findings.map((finding: any, i: number) => {
                          const isString = typeof finding === 'string';
                          const problem = isString ? finding : finding.problem;
                          const solution = isString ? null : finding.solution;
                          
                          return (
                            <div key={i} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-800 block">Issue identified:</span>
                                  <p className="text-gray-600">{problem}</p>
                                </div>
                              </div>
                              
                              {(solution || isString) && (
                                <motion.div 
                                  initial={false}
                                  animate={{ 
                                    filter: hasGivenFeedback ? "blur(0px)" : "blur(5px)",
                                    opacity: hasGivenFeedback ? 1 : 0.5 
                                  }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="flex items-start gap-2 mt-2 select-none"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                  <div>
                                    <span className="font-semibold text-green-800 block">Recommended Solution:</span>
                                    <p className="text-gray-600">{isString && !hasGivenFeedback ? "Detailed solution available in the unlocked view." : solution || finding}</p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600">No major issues identified.</p>
                    )}
                    {section.rewrite_offer && (
                      <motion.div 
                        initial={false}
                        animate={{ 
                          filter: hasGivenFeedback ? "blur(0px)" : "blur(5px)",
                          opacity: hasGivenFeedback ? 1 : 0.5 
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mt-4 bg-blue-50 text-blue-800 p-4 rounded-lg font-medium select-none"
                      >
                        <strong>Action Needed:</strong> This section requires significant rewriting. Our detailed recommendation is blurred.
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">4</div>
                <h3 className="text-2xl font-bold text-gray-900">ATS & Recruiter Risk Flags</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  <strong>What is ATS and why it matters:</strong><br/>
                  An Applicant Tracking System (ATS) is software recruiters use to scan, parse, and filter CVs before a human sees them. Poor formatting — such as tables, non-standard layouts, or functional structures — can cause your CV to be read incorrectly or filtered out.
                </p>
                
                {data?.ats_flags && data.ats_flags.length > 0 ? (
                  <div className="bg-red-50/80 p-6 rounded-xl border border-red-200 mt-4">
                    <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> High-Risk Issues Identified
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-red-800">
                      {data.ats_flags.map((flag: any, idx: number) => (
                        <li key={idx}><strong>{flag.risk_level} Risk:</strong> {flag.flag}</li>
                      ))}
                    </ul>
                    <p className="text-red-900 font-semibold mt-4">
                      These issues can cause your CV to be rejected before a recruiter even sees it.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200 mt-4">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> No major ATS issues detected
                    </h4>
                  </div>
                )}
              </div>
            </section>

            {/* Section 5 */}
            <section className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">5</div>
                <h3 className="text-2xl font-bold text-gray-900">Priority Fix List — Top Actions</h3>
              </div>
              
              <motion.div 
                initial={false}
                animate={{ 
                  filter: hasGivenFeedback ? "blur(0px)" : "blur(6px)",
                  opacity: hasGivenFeedback ? 1 : 0.6 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white p-6 rounded-xl border-2 border-green-100 shadow-sm select-none"
              >
                <p className="text-gray-600 mb-4 font-medium">Here is what you should fix first, in order of impact:</p>
                {data?.priority_fixes && data.priority_fixes.length > 0 ? (
                  <ol className="list-decimal pl-5 space-y-3 text-gray-800 font-medium">
                    {data.priority_fixes.sort((a: any, b: any) => a.rank - b.rank).map((fix: any, idx: number) => (
                      <li key={idx}>{fix.action}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-600">Your CV is looking great, no critical priority fixes needed right now.</p>
                )}
              </motion.div>

              <AnimatePresence>
                {!hasGivenFeedback && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                  >
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold text-gray-700">Unlock below to view priority fixes</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

          </div>

          {/* Paywall / Auth Gate Overlay -> CTA */}
          <div className="relative z-20 pb-12 px-8 -mt-8">
            <AnimatePresence mode="wait">
              {!hasGivenFeedback ? (
                <motion.div 
                  key="feedback-form"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.5 }}
                  className="bg-white shadow-2xl rounded-3xl p-8 max-w-2xl mx-auto text-center border-2 border-blue-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400" />
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Unlock Your Solutions</h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    You can see your scores and identified issues above. To reveal our <strong>recommended solutions</strong> and <strong>priority fixes</strong> in real-time, please leave a quick feedback on your experience.
                  </p>
                  <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3">
                    <textarea
                      required
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what you think..."
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none h-24 text-gray-900 bg-white"
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg">
                      Submit & Unlock Solutions
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="cta-form"
                  initial={{ opacity: 0, y: 40, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-900 to-indigo-900 shadow-2xl rounded-3xl p-8 md:p-12 max-w-3xl mx-auto text-center border border-indigo-500/30 relative overflow-hidden text-white"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                    {data?.custom_cta?.headline || "Don't let these mistakes cost you your dream job."}
                  </h3>
                  
                  <p className="text-blue-100 mb-8 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                    {data?.custom_cta?.body || "Your CV has critical flaws that ATS systems and recruiters are actively filtering out. We can fix these issues, perfectly align your experience, and rewrite your bullet points for maximum impact."}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a 
                      href={`https://wa.me/971501234567?text=${encodeURIComponent(data?.custom_cta?.whatsapp_message || 'Hi, I just got my CV reviewed and I need professional help fixing it. Can we schedule a consultation?')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-8 rounded-full transition shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Contact on WhatsApp
                    </a>
                    
                    <a 
                      href="mailto:info@careerpilot.com?subject=Professional CV Review Request"
                      className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-8 rounded-full transition hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Send an Email
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
