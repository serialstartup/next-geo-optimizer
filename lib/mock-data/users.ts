/**
 * Mock User/Profile Data
 *
 * Contains mock user profiles for development and testing.
 * Includes users with different subscription plans.
 */

import type { Profile } from '@/types/database';

// ============================================================================
// MOCK USER IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_USER_IDS = {
  FREE_USER: '550e8400-e29b-41d4-a716-446655440001',
  PRO_USER: '550e8400-e29b-41d4-a716-446655440002',
} as const;

// ============================================================================
// MOCK PROFILES
// ============================================================================

/**
 * Free tier user - Sarah Chen
 * A small business owner just getting started with GEO optimization
 */
export const mockFreeUser: Profile = {
  id: MOCK_USER_IDS.FREE_USER,
  email: 'sarah.chen@greenleaf-organic.com',
  full_name: 'Sarah Chen',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  plan: 'free',
  created_at: '2026-01-15T08:30:00.000Z',
  updated_at: '2026-01-28T14:22:00.000Z',
};

/**
 * Pro tier user - Marcus Rodriguez
 * A marketing director at a tech company actively using GEO optimization
 */
export const mockProUser: Profile = {
  id: MOCK_USER_IDS.PRO_USER,
  email: 'marcus.rodriguez@acme-tech.com',
  full_name: 'Marcus Rodriguez',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
  plan: 'pro',
  created_at: '2025-11-20T10:15:00.000Z',
  updated_at: '2026-02-01T09:45:00.000Z',
};

// ============================================================================
// MOCK PROFILES ARRAY
// ============================================================================

export const mockProfiles: Profile[] = [mockFreeUser, mockProUser];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current mock user (defaults to pro user for richer demo experience)
 */
export function getMockCurrentUser(): Profile {
  return mockProUser;
}

/**
 * Get a mock profile by ID
 */
export function getMockProfileById(id: string): Profile | undefined {
  return mockProfiles.find((profile) => profile.id === id);
}

/**
 * Get a mock profile by email
 */
export function getMockProfileByEmail(email: string): Profile | undefined {
  return mockProfiles.find((profile) => profile.email === email);
}

/**
 * Get all mock profiles
 */
export function getMockProfiles(): Profile[] {
  return mockProfiles;
}

/**
 * Get mock profiles by plan
 */
export function getMockProfilesByPlan(plan: Profile['plan']): Profile[] {
  return mockProfiles.filter((profile) => profile.plan === plan);
}
