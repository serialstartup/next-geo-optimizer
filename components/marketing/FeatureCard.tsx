import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "highlight";
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "default",
}: FeatureCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        variant === "highlight"
          ? "border-primary/30 bg-primary/5"
          : "border-border/50 bg-card/50"
      }`}
    >
      <CardHeader>
        <div
          className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${
            variant === "highlight"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
