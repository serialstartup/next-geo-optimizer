/**
 * Brand Voice Server Actions
 *
 * Server actions for managing brand voice configurations.
 * Uses mock data when USE_MOCK_DATA is true.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { getMockBrandVoiceBySiteId, getMockCurrentBrandVoice } from '@/lib/mock-data';
import type { BrandVoice, Audience, Guardrail, MachineProfile } from '@/types/database';

// ============================================================================
// SCHEMAS
// ============================================================================

const audienceSchema = z.object({
  demographic_context: z.string().optional(),
  intent_signals: z.array(z.string()).optional(),
  decision_factors: z.array(z.string()).optional(),
});

const guardrailSchema = z.object({
  avoid: z.string(),
  reason: z.string(),
});

const machineProfileSchema = z.object({
  intent: z.string().optional(),
  audience_cluster: z.array(z.string()).optional(),
  narrative_weight: z.record(z.string(), z.number()).optional(),
  forbidden_tokens: z.array(z.string()).optional(),
  alignmentScore: z.number().optional(),
});

export const saveBrandVoiceSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  positioning: z.enum(['budget', 'premium', 'niche', 'expert']).nullable().optional(),
  positioningDescription: z.string().nullable().optional(),
  audience: audienceSchema.optional(),
  differentiators: z.array(z.string()).optional(),
  guardrails: z.array(guardrailSchema).optional(),
  machineProfile: machineProfileSchema.optional(),
  alignmentScore: z.number().min(0).max(100).nullable().optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// MOCK HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate alignment score based on form completeness
 */
function calculateMockAlignmentScore(
  positioning: string | null,
  demographicContext: string,
  differentiators: string[],
  guardrails: Guardrail[]
): number {
  let score = 0;
  
  if (positioning) score += 20;
  if (demographicContext.length > 50) score += 20;
  else if (demographicContext.length > 0) score += 10;
  score += Math.min(differentiators.length * 10, 30);
  score += Math.min(guardrails.length * 15, 30);
  
  return Math.min(score, 100);
}

/**
 * Generate mock machine profile from form data
 */
function generateMockMachineProfile(
  positioning: string | null,
  demographicContext: string
): MachineProfile {
  const intentMap: Record<string, string> = {
    budget: 'value_focused_provider',
    premium: 'premium_market_leader',
    niche: 'specialized_solution_provider',
    expert: 'industry_expert_authority',
  };

  const audienceCluster: string[] = [];
  const contextLower = demographicContext.toLowerCase();
  
  if (contextLower.includes('enterprise') || contextLower.includes('cto')) {
    audienceCluster.push('enterprise_decision_makers');
  }
  if (contextLower.includes('technical') || contextLower.includes('developer')) {
    audienceCluster.push('technical_executives');
  }
  if (audienceCluster.length === 0) {
    audienceCluster.push('general_audience');
  }

  const narrativeWeight: Record<string, number> = {};
  if (positioning === 'premium') {
    narrativeWeight.reliability = 0.95;
    narrativeWeight.innovation = 0.82;
    narrativeWeight.cost_efficiency = 0.15;
  } else if (positioning === 'budget') {
    narrativeWeight.cost_efficiency = 0.95;
    narrativeWeight.value = 0.85;
  } else if (positioning === 'niche') {
    narrativeWeight.specialization = 0.95;
    narrativeWeight.expertise = 0.85;
  } else if (positioning === 'expert') {
    narrativeWeight.authority = 0.95;
    narrativeWeight.expertise = 0.90;
  } else {
    narrativeWeight.reliability = 0.70;
  }

  return {
    intent: positioning ? intentMap[positioning] : 'general_provider',
    audience_cluster: audienceCluster,
    narrative_weight: narrativeWeight,
    forbidden_tokens: positioning === 'premium' ? ['cheap', 'basic', 'generic'] : ['n/a'],
  };
}

// ============================================================================
// MOCK ACTIONS (For Development)
// ============================================================================

/**
 * Mock saveBrandVoice action - returns updated mock data
 */
export async function saveBrandVoice(
  input: z.infer<typeof saveBrandVoiceSchema>
): Promise<ActionResult<BrandVoice>> {
  console.log('[MOCK] saveBrandVoice called with:', input);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const existingMock = getMockCurrentBrandVoice();
  const alignmentScore = calculateMockAlignmentScore(
    input.positioning || null,
    input.audience?.demographic_context || '',
    input.differentiators || [],
    input.guardrails || []
  );
  
  const updatedMock: BrandVoice = {
    id: existingMock.id,
    site_id: input.siteId || existingMock.site_id,
    positioning: input.positioning ?? existingMock.positioning,
    positioning_description: input.positioningDescription ?? existingMock.positioning_description,
    audience: (input.audience as Audience) || existingMock.audience,
    differentiators: input.differentiators || existingMock.differentiators,
    guardrails: (input.guardrails as Guardrail[]) || existingMock.guardrails,
    machine_profile: generateMockMachineProfile(
      input.positioning || null,
      input.audience?.demographic_context || ''
    ),
    alignment_score: alignmentScore,
    created_at: existingMock.created_at,
    updated_at: new Date().toISOString(),
  };
  
  return { success: true, data: updatedMock };
}

/**
 * Mock getBrandVoice action - returns mock data
 */
export async function getBrandVoice(siteId: string): Promise<ActionResult<BrandVoice | null>> {
  console.log('[MOCK] getBrandVoice called with siteId:', siteId);
  
  const mockBrandVoice = getMockBrandVoiceBySiteId(siteId);
  
  if (mockBrandVoice) {
    return { success: true, data: mockBrandVoice };
  }
  
  return { success: true, data: getMockCurrentBrandVoice() };
}

// ============================================================================
// DATABASE ACTIONS (Production - Uncomment when database is connected)\n// ============================================================================\n\n/*\n\n// Uncomment these functions when the database is connected\n\nconst audienceSchema = z.object({\n  demographic_context: z.string().optional(),\n  intent_signals: z.array(z.string()).optional(),\n  decision_factors: z.array(z.string()).optional(),\n});\n\nconst guardrailSchema = z.object({\n  avoid: z.string(),\n  reason: z.string(),\n});\n\nconst machineProfileSchema = z.object({\n  intent: z.string().optional(),\n  audience_cluster: z.array(z.string()).optional(),\n  narrative_weight: z.record(z.string(), z.number()).optional(),\n  forbidden_tokens: z.array(z.string()).optional(),\n  alignmentScore: z.number().optional(),\n});\n\nconst dbSaveBrandVoiceSchema = z.object({\n  siteId: z.string().uuid('Invalid site ID'),\n  positioning: z.enum(['budget', 'premium', 'niche', 'expert']).nullable().optional(),\n  positioningDescription: z.string().nullable().optional(),\n  audience: audienceSchema.optional(),\n  differentiators: z.array(z.string()).optional(),\n  guardrails: z.array(guardrailSchema).optional(),\n  machineProfile: machineProfileSchema.optional(),\n  alignmentScore: z.number().min(0).max(100).nullable().optional(),\n});\n\nexport async function saveBrandVoice(\n  input: z.infer<typeof dbSaveBrandVoiceSchema>\n): Promise<ActionResult<BrandVoice>> {\n  try {\n    const supabase = await createServerClient();\n    const { data: { user } } = await supabase.auth.getUser();\n\n    if (!user) {\n      return { success: false, error: 'Unauthorized' };\n    }\n\n    const parseResult = dbSaveBrandVoiceSchema.safeParse(input);\n    if (!parseResult.success) {\n      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };\n    }\n\n    const { siteId, positioning, positioningDescription, audience, differentiators, guardrails, machineProfile, alignmentScore } = parseResult.data;\n\n    const { data: site } = await supabase\n      .from('sites')\n      .select('id')\n      .eq('id', siteId)\n      .eq('user_id', user.id)\n      .single();\n\n    if (!site) {\n      return { success: false, error: 'Site not found' };\n    }\n\n    const { data: existingBrandVoice } = await supabase\n      .from('brand_voices')\n      .select('id')\n      .eq('site_id', siteId)\n      .single();\n\n    const brandVoiceData: Record<string, unknown> = { site_id: siteId };\n    if (positioning !== undefined) brandVoiceData.positioning = positioning;\n    if (positioningDescription !== undefined) brandVoiceData.positioning_description = positioningDescription;\n    if (audience !== undefined) brandVoiceData.audience = audience;\n    if (differentiators !== undefined) brandVoiceData.differentiators = differentiators;\n    if (guardrails !== undefined) brandVoiceData.guardrails = guardrails;\n    if (machineProfile !== undefined) brandVoiceData.machine_profile = machineProfile;\n    if (alignmentScore !== undefined) brandVoiceData.alignment_score = alignmentScore;\n\n    let brandVoice: BrandVoice;\n\n    if (existingBrandVoice) {\n      const { data, error } = await supabase\n        .from('brand_voices')\n        .update(brandVoiceData as never)\n        .eq('site_id', siteId)\n        .select()\n        .single();\n\n      if (error) return { success: false, error: 'Failed to update brand voice' };\n      brandVoice = data as BrandVoice;\n    } else {\n      const { data, error } = await supabase\n        .from('brand_voices')\n        .insert(brandVoiceData as never)\n        .select()\n        .single();\n\n      if (error) return { success: false, error: 'Failed to create brand voice' };\n      brandVoice = data as BrandVoice;\n    }\n\n    revalidatePath('/brand-voice');\n    revalidatePath('/');\n\n    return { success: true, data: brandVoice };\n  } catch (error) {\n    console.error('Error in saveBrandVoice:', error);\n    return { success: false, error: 'An unexpected error occurred' };\n  }\n}\n\nexport async function getBrandVoice(siteId: string): Promise<ActionResult<BrandVoice | null>> {\n  try {\n    const supabase = await createServerClient();\n    const { data: { user } } = await supabase.auth.getUser();\n\n    if (!user) {\n      return { success: false, error: 'Unauthorized' };\n    }\n\n    const { data: site } = await supabase\n      .from('sites')\n      .select('id')\n      .eq('id', siteId)\n      .eq('user_id', user.id)\n      .single();\n\n    if (!site) {\n      return { success: false, error: 'Site not found' };\n    }\n\n    const { data: brandVoice, error } = await supabase\n      .from('brand_voices')\n      .select('*')\n      .eq('site_id', siteId)\n      .single();\n\n    if (error) {\n      if (error.code === 'PGRST116') {\n        return { success: true, data: null };\n      }\n      return { success: false, error: 'Failed to get brand voice' };\n    }\n\n    return { success: true, data: brandVoice as BrandVoice };\n  } catch (error) {\n    console.error('Error in getBrandVoice:', error);\n    return { success: false, error: 'An unexpected error occurred' };\n  }\n}\n\n*/
