import type { User } from "@supabase/supabase-js";

export const FREE_REVIEW_LIMIT = 1;

export function getUserPlan(user: User | null) {
  const plan = user?.user_metadata?.plan;
  return plan === "premium" ? "premium" : "free";
}

export function isPremiumUser(user: User | null) {
  return getUserPlan(user) === "premium";
}

export function hasReachedFreeReviewLimit(reviewCount: number, user: User | null) {
  return !isPremiumUser(user) && reviewCount >= FREE_REVIEW_LIMIT;
}
