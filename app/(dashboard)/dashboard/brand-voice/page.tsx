/**
 * Brand Voice Configuration Page
 *
 * Configure how AI systems should perceive and represent your brand.
 * Includes positioning, audience, differentiators, and guardrails.
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { BrandVoiceForm, type BrandVoiceFormData } from '@/components/dashboard/BrandVoiceForm';
import { MachineProfilePreview } from '@/components/dashboard/MachineProfilePreview';
import { Save } from 'lucide-react';
import { getMockCurrentBrandVoice } from '@/lib/mock-data';
import type { BrandPositioning, Guardrail } from '@/types/database';

// ============================================================================
// INITIAL DATA FROM MOCK
// ============================================================================

function getInitialData(): BrandVoiceFormData {
  const mockBrandVoice = getMockCurrentBrandVoice();
  
  return {
    positioning: mockBrandVoice.positioning,
    positioningDescription: mockBrandVoice.positioning_description || '',
    demographicContext: mockBrandVoice.audience?.demographic_context || 
      'Enterprise CTOs and Lead Architects in Global 2000 companies. High-level decision makers focused on technical resilience and efficiency.',
    intentSignals: mockBrandVoice.audience?.intent_signals || [],
    decisionFactors: mockBrandVoice.audience?.decision_factors || [],
    differentiators: mockBrandVoice.differentiators?.slice(0, 3) || ['Proprietary AI', 'Real-time Sync', 'Zero Latency'],
    guardrails: mockBrandVoice.guardrails?.slice(0, 2) || [
      { avoid: 'Avoid "Discount" terminology', reason: 'Dilutes premium brand value in comparison tables.' },
      { avoid: 'Reject "Out-of-the-box" labels', reason: 'We emphasize custom-fit enterprise solutions.' },
    ],
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function BrandVoicePage() {
  const [formData, setFormData] = useState<BrandVoiceFormData>(getInitialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle form data changes
  const handleDataChange = useCallback((data: BrandVoiceFormData) => {
    setFormData(data);
    setSaveSuccess(false);
  }, []);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In production, this would call the server action:
      // const result = await saveBrandVoice({
      //   siteId: currentSiteId,
      //   positioning: formData.positioning,
      //   positioningDescription: formData.positioningDescription,
      //   audience: {
      //     demographic_context: formData.demographicContext,
      //     intent_signals: formData.intentSignals,
      //     decision_factors: formData.decisionFactors,
      //   },
      //   differentiators: formData.differentiators,
      //   guardrails: formData.guardrails,
      // });
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving brand voice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate alignment score based on form completeness
  const calculateAlignmentScore = (): number => {
    let score = 0;
    
    // Positioning selected: +20
    if (formData.positioning) score += 20;
    
    // Demographic context filled: +20
    if (formData.demographicContext.length > 50) score += 20;
    else if (formData.demographicContext.length > 0) score += 10;
    
    // Differentiators: +5 each, max 30
    score += Math.min(formData.differentiators.length * 10, 30);
    
    // Guardrails: +10 each, max 30
    score += Math.min(formData.guardrails.length * 15, 30);
    
    return Math.min(score, 100);
  };

  return (
    <div className="p-6 lg:p-8 bg-[#0f1219] min-h-screen">
      <PageHeader
        title="Machine-Readable Brand Intent"
        subtitle="Configure how generative engines perceive and categorize your brand identity to influence recommendation weights."
        actions={
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`${
              saveSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Configuration Form */}
        <div className="lg:col-span-2">
          <BrandVoiceForm
            initialData={formData}
            onDataChange={handleDataChange}
            isLoading={isSaving}
          />
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-1">
          <MachineProfilePreview
            positioning={formData.positioning}
            demographicContext={formData.demographicContext}
            differentiators={formData.differentiators}
            guardrails={formData.guardrails}
            alignmentScore={calculateAlignmentScore()}
            isLive={true}
          />
        </div>
      </div>
    </div>
  );
}
