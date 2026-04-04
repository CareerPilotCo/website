export interface ReviewSectionFinding {
  problem: string;
  solution?: string;
}

export interface ReviewSection {
  name: string;
  score: number;
  max_score: number;
  status: "Strong" | "Acceptable" | "Needs Work" | "Critical Risk";
  findings?: Array<ReviewSectionFinding | string>;
  rewrite_offer?: boolean;
}

export interface AtsFlag {
  flag: string;
  risk_level: "High" | "Medium";
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
  verdict?: "Keep" | "Maybe" | "Toss";
  verdict_reason?: string;
  executive_summary?: string;
  total_score?: number;
  sections?: ReviewSection[];
  ats_flags?: AtsFlag[];
  priority_fixes?: PriorityFix[];
  custom_cta?: CustomCta;
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
