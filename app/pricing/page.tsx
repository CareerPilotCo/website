import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Crown, MessageSquareText } from "lucide-react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { FREE_REVIEW_LIMIT } from "@/lib/account";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "A strong first review for new users who want to test the platform.",
    features: [
      `${FREE_REVIEW_LIMIT} saved CV review`,
      "AI score, verdict, and section analysis",
      "Actionable feedback and WhatsApp CTA",
    ],
    ctaLabel: "Start Free",
    ctaHref: "/",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "Reach Out",
    description: "For job seekers who want to iterate, improve, and keep refining their CV.",
    features: [
      "Unlimited CV reviews",
      "Full saved review history",
      "Priority upgrade and coaching CTA path",
    ],
    ctaLabel: "Upgrade via WhatsApp",
    ctaHref: "https://wa.me/00201123388223?text=Hi%2C%20I%20want%20to%20upgrade%20to%20CareerPilot%20Premium.",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradientAnimation>
        <div className="relative z-50 flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-white/20 bg-white/40 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/careerpilot-logo-20260409.png"
                  alt="CareerPilot Logo"
                  width={240}
                  height={60}
                  className="h-14 w-auto object-contain cursor-pointer"
                />
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-full border border-white/30 bg-white/60 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/80"
                >
                  Back Home
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              </div>
            </nav>
          </header>

          <main className="flex-1 px-6 py-16 md:py-24">
            <section className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Pricing</p>
                <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
                  Review once for free. Upgrade when you need momentum.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-gray-600">
                  CareerPilot gives every user one free saved CV review. Premium is built for job seekers who want to test revisions, compare versions, and keep improving without a limit.
                </p>
              </div>

              <div className="mt-14 grid gap-8 lg:grid-cols-2">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-[2rem] border p-8 shadow-xl ${
                      plan.highlighted
                        ? "border-blue-300 bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900 text-white"
                        : "border-white/50 bg-white/75 text-gray-900 backdrop-blur-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${
                          plan.highlighted ? "text-blue-200" : "text-gray-500"
                        }`}>
                          {plan.name}
                        </p>
                        <h2 className="mt-3 text-4xl font-bold">{plan.price}</h2>
                      </div>
                      <div className={`rounded-2xl p-4 ${
                        plan.highlighted ? "bg-white/10" : "bg-blue-50"
                      }`}>
                        {plan.highlighted ? <Crown className="h-8 w-8 text-amber-300" /> : <CheckCircle2 className="h-8 w-8 text-blue-700" />}
                      </div>
                    </div>

                    <p className={`mt-6 text-base leading-relaxed ${
                      plan.highlighted ? "text-blue-100" : "text-gray-600"
                    }`}>
                      {plan.description}
                    </p>

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${
                            plan.highlighted ? "text-emerald-300" : "text-emerald-600"
                          }`} />
                          <span className={plan.highlighted ? "text-blue-50" : "text-gray-700"}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.ctaHref.startsWith("http") ? (
                      <a
                        href={plan.ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition ${
                          plan.highlighted
                            ? "bg-white text-blue-950 hover:bg-blue-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {plan.highlighted && <MessageSquareText className="h-4 w-4" />}
                        {plan.ctaLabel}
                      </a>
                    ) : (
                      <Link
                        href={plan.ctaHref}
                        className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition ${
                          plan.highlighted
                            ? "bg-white text-blue-950 hover:bg-blue-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {plan.ctaLabel}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              
            </section>
          </main>
        </div>
      </BackgroundGradientAnimation>
    </div>
  );
}
