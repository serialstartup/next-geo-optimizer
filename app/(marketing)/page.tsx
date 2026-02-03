import {
  HeroSection,
  BenefitCard,
  CTASection,
  ProcessStep,
} from "@/components/marketing";
import {
  Eye,
  Settings,
  TrendingUp,
  Search,
  FileText,
  Bell,
  Wrench,
  Globe,
  Sparkles,
  CheckCircle,
  Target,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* GEO Pillar Framework Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="flex flex-col gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              The GEO Pillar Framework
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Take control of your brand&apos;s narrative in the age of generative
              intelligence with our three-step circular workflow.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-primary border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <BenefitCard
              icon={Eye}
              title="Understand"
              description="See exactly how LLMs like GPT-4, Claude 3, and Gemini categorize and perceive your brand across all major semantic dimensions."
            />
            <BenefitCard
              icon={Settings}
              title="Control"
              description="Influence the training data sources, structured metadata, and context windows that matters most to AI knowledge graphs and retrieval systems."
            />
            <BenefitCard
              icon={TrendingUp}
              title="Improve"
              description="Systematically increase your citation frequency, brand authority scores, and recommendation rates in live AI-generated answers."
            />
          </div>
        </div>
      </section>

      {/* SEO vs GEO Comparison Section */}
      <section id="seo-vs-geo" className="py-20 md:py-32">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              SEO vs. GEO: The Strategic Shift
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Why your 2023 search strategy won&apos;t work in the 2025 AI landscape.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/30">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-4 md:p-6 border-b border-border/50 bg-muted/30">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Strategy
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Traditional SEO
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Generative Engine Opt (GEO)
              </div>
            </div>

            {/* Table Rows */}
            <ComparisonRow
              strategy="Primary Goal"
              seo="Search Engine Ranking (SERP)"
              geo="AI Model Recommendation"
            />
            <ComparisonRow
              strategy="Core Metric"
              seo="Keyword Density & Volume"
              geo="Semantic Relevance & Sentiment"
            />
            <ComparisonRow
              strategy="Methodology"
              seo="Backlink Building"
              geo="Knowledge Graph Integration"
            />
            <ComparisonRow
              strategy="User Intent"
              seo="Information Retrieval"
              geo="Contextual Synthesis & Advice"
              isLast
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="product" className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need for AI Visibility
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Comprehensive tools to understand, control, and improve how AI
              systems represent your brand.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureItem
              icon={Search}
              title="GEO Visibility Audit"
              description="Analyze how well your website is understood by AI systems with detailed scoring and insights."
            />
            <FeatureItem
              icon={MessageSquare}
              title="Brand Voice for AI"
              description="Define how AI systems should describe, position, and differentiate your brand."
            />
            <FeatureItem
              icon={Target}
              title="AI Recommendation Readiness"
              description="Evaluate whether your brand is likely to be mentioned, compared, or recommended by AI."
            />
            <FeatureItem
              icon={Bell}
              title="Continuous Monitoring"
              description="Track how AI visibility and interpretation change over time with real-time alerts."
            />
            <FeatureItem
              icon={Wrench}
              title="Actionable Fixes"
              description="Every insight turns into a clear explanation, specific action, and measurable impact."
            />
            <FeatureItem
              icon={FileText}
              title="Content Workspace"
              description="AI-suggested rewrites, entity improvements, and answer-first restructuring tools."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="solutions" className="py-20 md:py-32">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Get started in minutes with our simple five-step process.
            </p>
          </div>

          <div className="grid gap-8 md:gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
            <ProcessStep
              step={1}
              icon={Globe}
              title="Add Your Site"
              description="Enter your domain and configure crawl settings."
            />
            <ProcessStep
              step={2}
              icon={Search}
              title="Run GEO Audit"
              description="We analyze your content across AI dimensions."
            />
            <ProcessStep
              step={3}
              icon={MessageSquare}
              title="Define Brand Voice"
              description="Set how AI should represent your brand."
            />
            <ProcessStep
              step={4}
              icon={Wrench}
              title="Get Recommendations"
              description="Receive prioritized actions to improve."
            />
            <ProcessStep
              step={5}
              icon={TrendingUp}
              title="Monitor Progress"
              description="Track improvements over time."
              isLast
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

// Helper Components

function ComparisonRow({
  strategy,
  seo,
  geo,
  isLast = false,
}: {
  strategy: string;
  seo: string;
  geo: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-3 gap-4 p-4 md:p-6 ${
        !isLast ? "border-b border-border/50" : ""
      }`}
    >
      <div className="text-sm font-medium">{strategy}</div>
      <div className="text-sm text-muted-foreground">{seo}</div>
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        <span>{geo}</span>
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-6 rounded-xl border border-border/50 bg-card/30 transition-all hover:border-primary/30 hover:bg-primary/5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
