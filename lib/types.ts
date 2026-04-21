export interface ReviewSectionFinding {
  problem: string;
  solution?: string;
}

export type ReviewSectionStatus =
  | "Strong"
  | "Acceptable"
  | "Needs Work"
  | "Critical Risk"
  | "Likely to Hire"
  | "Maybe"
  | "Not Yet"
  | "Likely Rejected";

export interface ReviewSection {
  name: string;
  score: number;
  max_score: number;
  status: ReviewSectionStatus;
  findings?: Array<ReviewSectionFinding | string>;
  rewrite_offer?: boolean;
}

export interface AtsFlag {
  flag: string;
  risk_level: "High" | "Medium";
}

export interface AtsRecruiterRiskFlag extends AtsFlag {
  type?: "ats" | "hygiene";
  original_text?: string;
  issue_type?: "spelling" | "grammar" | "formatting" | "structure";
  severity?: "Minor Issue" | "Credibility Risk";
  is_systemic?: boolean;
}

export interface PriorityFix {
  rank: number;
  action: string;
}

export interface CustomCta {
  headline?: string;
  body?: string;
  whatsapp_message?: string;
}

export interface ReviewData {
  candidate_name?: string | null;
  verdict?: "Keep" | "Maybe" | "Needs Work" | "Needs work" | "Toss";
  verdict_reason?: string;
  career_level?: "Early Career" | "Experienced" | "Senior / Manager" | "Senior/Manager" | string;
  executive_summary?: string;
  total_score?: number;
  sections?: ReviewSection[];
  ats_flags?: AtsFlag[];
  ats_recruiter_risk_flags?: AtsRecruiterRiskFlag[];
  priority_fixes?: PriorityFix[];
  custom_cta?: CustomCta;
  overhaul_offer?: boolean;
  hygiene_risk_label?: string | null;
}

export interface ReviewSuccessResult {
  type: "success";
  data: ReviewData;
}

export interface ReviewErrorResult {
  type: "error";
  error_code?: string;
  error_message: string;
}

export type ReviewResult = ReviewSuccessResult | ReviewErrorResult;

export interface SavedReview {
  id: string;
  created_at: string;
  career_level: string;
  analysis_result: ReviewResult;
}
