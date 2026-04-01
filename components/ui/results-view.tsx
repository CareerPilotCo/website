"use client";

import { motion } from "framer-motion";
import { Lock, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ResultsViewProps {
  isLoggedIn?: boolean;
  results?: any;
}

export function ResultsView({ isLoggedIn = false, results }: ResultsViewProps) {
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
            <p>
              {data?.executive_summary || "Your CV has solid experience content, but it is not structured as a Fresh-level CV, and several key elements required for early-career applications are missing — especially a Career Objective, skills list, and modern contact formatting."}
            </p>
            {data?.verdict && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-900 block mb-1">Overall readiness: {data.verdict}</strong>
                  <span className="text-orange-800">{data.verdict_reason}</span>
                </div>
              </div>
            )}
            {!data && (
              <p>
                The document uses a functional format, which causes significant ATS risks and makes your experience harder for recruiters to scan. With the right restructuring, your CV can become much clearer and far more competitive.
              </p>
            )}
            {!data && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-900 block mb-1">Overall readiness:</strong>
                  <span className="text-orange-800">Needs significant revision before submitting to employers.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Locked Content Area */}
        <div className="relative">
          {/* Content (Blurred if not logged in) */}
          <div className={`p-8 md:p-12 space-y-12 ${!isLoggedIn ? 'filter blur-[6px] select-none opacity-60 pointer-events-none' : ''}`}>
            
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
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium">Contact Information</td>
                      <td className="p-4 text-orange-600">Present but Weak</td>
                      <td className="p-4 text-right font-semibold">4 / 10</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium">Career Objective <span className="text-sm font-normal text-gray-500">(Fresh level)</span></td>
                      <td className="p-4 text-red-600">Missing</td>
                      <td className="p-4 text-right font-semibold">0 / 10</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium">Work Experience / Internships</td>
                      <td className="p-4 text-green-600">Present</td>
                      <td className="p-4 text-right font-semibold">22 / 30</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium">Skills</td>
                      <td className="p-4 text-red-600">Missing</td>
                      <td className="p-4 text-right font-semibold">0 / 20</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium">Education</td>
                      <td className="p-4 text-green-600">Present</td>
                      <td className="p-4 text-right font-semibold">8 / 10</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium">ATS Structure & Formatting</td>
                      <td className="p-4 text-red-600">High Risk</td>
                      <td className="p-4 text-right font-semibold">3 / 10</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <td colSpan={2} className="p-4 font-bold text-gray-900">Total Score</td>
                      <td className="p-4 text-right font-bold text-xl text-blue-600">43 / 100</td>
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
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    Contact Information <span className="text-sm font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">Present but Weak</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Includes full street address — this is unnecessary and should be removed.</li>
                    <li>City and email are present, but phone number is missing entirely.</li>
                    <li>Presentation is dated and not aligned with modern CV standards.</li>
                  </ul>
                  <div className="mt-3 bg-blue-50 text-blue-800 p-4 rounded-lg font-medium">
                    <strong>Fix:</strong> Keep only Name | City | Phone | Email | LinkedIn (optional).
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    Career Objective <span className="text-sm font-semibold bg-red-100 text-red-700 px-3 py-1 rounded-full">Missing</span>
                  </h4>
                  <p className="text-gray-600 mb-2">Fresh-level CVs must include a forward-looking Career Objective explaining what you aim to contribute and what field you are targeting. Your CV instead starts with a Career Summary, which is appropriate only for mid-career professionals.</p>
                  <p className="text-gray-600">This mismatch weakens your early-career positioning.</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    Work Experience <span className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">Present</span>
                  </h4>
                  <p className="text-gray-600 mb-4">You have strong real experience, which is excellent for a Fresh candidate.</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
                      <h5 className="font-bold text-green-800 mb-2">Strengths</h5>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Clear responsibilities.</li>
                        <li>Shows progression across roles.</li>
                      </ul>
                    </div>
                    <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                      <h5 className="font-bold text-red-800 mb-2">Weaknesses</h5>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>All experience is grouped functionally, not chronologically.</li>
                        <li>Bullet points lack outcomes or impact.</li>
                        <li>Some responsibilities appear repeated.</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                
                <div className="bg-red-50/80 p-6 rounded-xl border border-red-200 mt-4">
                  <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> High-Risk Issues Identified
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-red-800">
                    <li>Functional format (ATS prefers chronological).</li>
                    <li>Section headers not standard (e.g., “Adult Care Experience,” “Childcare Experience” instead of “Work Experience”).</li>
                    <li>Full address — causes parsing errors.</li>
                    <li>Inconsistent spacing across sections.</li>
                    <li>Missing skills section — drastically reduces keyword matching.</li>
                  </ul>
                  <p className="text-red-900 font-semibold mt-4">
                    These issues can cause your CV to be rejected before a recruiter even sees it.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">5</div>
                <h3 className="text-2xl font-bold text-gray-900">Priority Fix List — Top 5 Actions</h3>
              </div>
              
              <div className="bg-white p-6 rounded-xl border-2 border-green-100 shadow-sm">
                <p className="text-gray-600 mb-4 font-medium">Here is what you should fix first, in order of impact:</p>
                <ol className="list-decimal pl-5 space-y-3 text-gray-800 font-medium">
                  <li>Add a proper Career Objective for Fresh-level CVs.</li>
                  <li>Create a clear Skills section with technical, soft, and domain skills.</li>
                  <li>Rebuild the Work Experience section into reverse-chronological order.</li>
                  <li>Remove your full address and add your phone number.</li>
                  <li>Correct spacing, bullet alignment, and header consistency.</li>
                </ol>
              </div>
            </section>

          </div>

          {/* Paywall / Auth Gate Overlay */}
          {!isLoggedIn && (
            <div className="absolute inset-0 z-10">
              {/* Fade gradient from top to hide content properly */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white rounded-b-3xl pointer-events-none" />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-20 bg-white shadow-2xl rounded-3xl p-8 max-w-lg mx-auto text-center border border-gray-100 mt-12 md:mt-24"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Unlock Full Detailed Review</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Register or login for free to see your complete CV analysis, detailed score breakdown, ATS risk flags, and priority fix list.
                </p>
                <div className="flex flex-col gap-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg">
                    Sign Up for Free
                  </button>
                  <button className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 font-bold py-4 px-8 rounded-full transition text-lg">
                    Log In to Your Account
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Your results are securely saved.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
