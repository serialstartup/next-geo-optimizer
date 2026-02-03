/**
 * BrandVoiceForm Component
 *
 * Form for configuring brand voice settings including positioning,
 * target audience, differentiators, and guardrails.
 */

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Users,
  Plus,
  X,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import type { BrandPositioning, Guardrail, Audience, MachineProfile } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface BrandVoiceFormData {
  positioning: BrandPositioning | null;
  positioningDescription: string;
  demographicContext: string;
  intentSignals: string[];
  decisionFactors: string[];
  differentiators: string[];
  guardrails: Guardrail[];
}

interface BrandVoiceFormProps {
  initialData: BrandVoiceFormData;
  onDataChange: (data: BrandVoiceFormData) => void;
  isLoading?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const positioningOptions: { value: BrandPositioning; label: string }[] = [
  { value: 'budget', label: 'Budget' },
  { value: 'premium', label: 'Premium' },
  { value: 'niche', label: 'Niche' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function BrandVoiceForm({
  initialData,
  onDataChange,
  isLoading = false,
}: BrandVoiceFormProps) {
  const [positioning, setPositioning] = useState<BrandPositioning | null>(initialData.positioning);
  const [positioningDescription, setPositioningDescription] = useState(initialData.positioningDescription);
  const [demographicContext, setDemographicContext] = useState(initialData.demographicContext);
  const [differentiators, setDifferentiators] = useState(initialData.differentiators);
  const [newDifferentiator, setNewDifferentiator] = useState('');
  const [guardrails, setGuardrails] = useState(initialData.guardrails);
  const [newGuardrailAvoid, setNewGuardrailAvoid] = useState('');
  const [newGuardrailReason, setNewGuardrailReason] = useState('');

  // Notify parent of data changes
  const notifyChange = useCallback((updates: Partial<BrandVoiceFormData>) => {
    onDataChange({
      positioning,
      positioningDescription,
      demographicContext,
      intentSignals: initialData.intentSignals,
      decisionFactors: initialData.decisionFactors,
      differentiators,
      guardrails,
      ...updates,
    });
  }, [positioning, positioningDescription, demographicContext, differentiators, guardrails, initialData, onDataChange]);

  // Positioning handlers
  const handlePositioningChange = (value: BrandPositioning) => {
    setPositioning(value);
    notifyChange({ positioning: value });
  };

  // Demographic context handler
  const handleDemographicChange = (value: string) => {
    setDemographicContext(value);
    notifyChange({ demographicContext: value });
  };

  // Differentiator handlers
  const handleAddDifferentiator = () => {
    if (newDifferentiator.trim()) {
      const updated = [...differentiators, newDifferentiator.trim()];
      setDifferentiators(updated);
      setNewDifferentiator('');
      notifyChange({ differentiators: updated });
    }
  };

  const handleRemoveDifferentiator = (index: number) => {
    const updated = differentiators.filter((_, i) => i !== index);
    setDifferentiators(updated);
    notifyChange({ differentiators: updated });
  };

  // Guardrail handlers
  const handleAddGuardrail = () => {
    if (newGuardrailAvoid.trim()) {
      const updated = [
        ...guardrails,
        { avoid: newGuardrailAvoid.trim(), reason: newGuardrailReason.trim() },
      ];
      setGuardrails(updated);
      setNewGuardrailAvoid('');
      setNewGuardrailReason('');
      notifyChange({ guardrails: updated });
    }
  };

  const handleRemoveGuardrail = (index: number) => {
    const updated = guardrails.filter((_, i) => i !== index);
    setGuardrails(updated);
    notifyChange({ guardrails: updated });
  };

  return (
    <div className="space-y-6">
      {/* Core Positioning */}
      <Card className="bg-[#1a1f2e] border-[#2a3142]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Target className="w-5 h-5 text-blue-400" />
            Core Positioning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {positioningOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePositioningChange(option.value)}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  positioning === option.value
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-[#2a3142] hover:border-[#3a4152] text-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            &ldquo;Premium&rdquo; tells AI engines to prioritize quality over price in comparative queries.
          </p>
        </CardContent>
      </Card>

      {/* Target Audience Definitions */}
      <Card className="bg-[#1a1f2e] border-[#2a3142]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Users className="w-5 h-5 text-blue-400" />
            Target Audience Definitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demographic" className="text-gray-300">
              Demographic Context
            </Label>
            <Textarea
              id="demographic"
              value={demographicContext}
              onChange={(e) => handleDemographicChange(e.target.value)}
              placeholder="Describe your target audience..."
              rows={4}
              disabled={isLoading}
              className="bg-[#0f1219] border-[#2a3142] text-white placeholder:text-gray-500 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Primary Differentiators */}
      <Card className="bg-[#1a1f2e] border-[#2a3142]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">Primary Differentiators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {differentiators.map((diff, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-500/10 text-blue-400 border border-blue-500/30 pl-3 pr-1 py-1.5 text-sm"
              >
                {diff}
                <button
                  onClick={() => handleRemoveDifferentiator(index)}
                  disabled={isLoading}
                  className="ml-2 p-0.5 rounded hover:bg-blue-500/20 disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <button
            onClick={handleAddDifferentiator}
            disabled={isLoading || !newDifferentiator.trim()}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Differentiator
          </button>
          <div className="flex gap-2">
            <Input
              value={newDifferentiator}
              onChange={(e) => setNewDifferentiator(e.target.value)}
              placeholder="Add differentiator..."
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDifferentiator()}
              className="bg-[#0f1219] border-[#2a3142] text-white placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Guardrails & Negative Constraints */}
      <Card className="bg-[#1a1f2e] border-[#2a3142]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <AlertCircle className="w-5 h-5 text-red-400" />
            AI Guardrails & Negative Constraints
          </CardTitle>
          <CardDescription className="text-gray-400">
            List associations or misinterpretations the AI should explicitly avoid when generating brand narratives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {guardrails.map((guardrail, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg bg-[#0f1219] border border-[#2a3142]"
            >
              <div className="flex-1">
                <p className="font-medium text-white">{guardrail.avoid}</p>
                {guardrail.reason && (
                  <p className="text-sm text-gray-400 mt-1">Reason: {guardrail.reason}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveGuardrail(index)}
                disabled={isLoading}
                className="p-1.5 rounded hover:bg-[#2a3142] text-gray-400 hover:text-gray-300 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddGuardrail}
            disabled={isLoading || !newGuardrailAvoid.trim()}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Guardrule
          </button>

          <div className="space-y-3 pt-2">
            <Input
              value={newGuardrailAvoid}
              onChange={(e) => setNewGuardrailAvoid(e.target.value)}
              placeholder="What to avoid (e.g., 'Budget-friendly' language)"
              disabled={isLoading}
              className="bg-[#0f1219] border-[#2a3142] text-white placeholder:text-gray-500"
            />
            <Input
              value={newGuardrailReason}
              onChange={(e) => setNewGuardrailReason(e.target.value)}
              placeholder="Reason (optional)"
              disabled={isLoading}
              className="bg-[#0f1219] border-[#2a3142] text-white placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
