import { LucideIcon } from "lucide-react";

interface ProcessStepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
}

export function ProcessStep({
  step,
  icon: Icon,
  title,
  description,
  isLast = false,
}: ProcessStepProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-1/2 top-12 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 to-transparent md:block lg:hidden" />
      )}
      {!isLast && (
        <div className="absolute left-full top-12 hidden h-px w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
      )}

      {/* Step indicator */}
      <div className="relative mb-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {step}
        </div>
      </div>

      {/* Content */}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">{description}</p>
    </div>
  );
}
