/**
 * Alert Server Actions
 *
 * Server actions for managing alerts and notifications.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { Alert, AlertType, AlertSeverity } from '@/types/database';

// ============================================================================
// SCHEMAS
// ============================================================================

const updateAlertSettingsSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  settings: z.object({
    emailNotifications: z.boolean().optional(),
    scoreDropThreshold: z.number().min(0).max(100).optional(),
    alertTypes: z.array(z.enum([
      'content_decay',
      'interpretation_shift',
      'visibility_drop',
      'score_change',
      'competitor_mention',
      'system',
    ])).optional(),
  }),
});

// ============================================================================
// TYPES
// ============================================================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AlertFilters {
  siteId?: string;
  type?: AlertType;
  severity?: AlertSeverity;
  read?: boolean;
  dismissed?: boolean;
  limit?: number;
}

export interface AlertSettings {
  emailNotifications: boolean;
  scoreDropThreshold: number;
  alertTypes: AlertType[];
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Gets alerts with optional filters
 *
 * @param filters - Optional filters
 * @returns Action result with alerts array
 */
export async function getAlerts(
  filters: AlertFilters = {}
): Promise<ActionResult<Alert[]>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Build query
    let query = supabase
      .from('alerts')
      .select(`
        *,
        sites!inner (user_id)
      `)
      .order('created_at', { ascending: false });

    if (filters.siteId) {
      query = query.eq('site_id', filters.siteId);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.read !== undefined) {
      query = query.eq('read', filters.read);
    }

    if (filters.dismissed !== undefined) {
      query = query.eq('dismissed', filters.dismissed);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error('Error getting alerts:', error);
      return { success: false, error: 'Failed to get alerts' };
    }

    // Filter by user ownership
    const userAlerts = (alerts || []).filter((alert) => {
      const typedAlert = alert as Alert & { sites: { user_id: string } };
      return typedAlert.sites.user_id === user.id;
    });

    return { success: true, data: userAlerts as Alert[] };
  } catch (error) {
    console.error('Error in getAlerts:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Marks an alert as read
 *
 * @param alertId - Alert ID
 * @returns Action result
 */
export async function markAlertAsRead(alertId: string): Promise<ActionResult<Alert>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const { data: alert, error: fetchError } = await supabase
      .from('alerts')
      .select(`
        *,
        sites!inner (user_id)
      `)
      .eq('id', alertId)
      .single();

    if (fetchError || !alert) {
      return { success: false, error: 'Alert not found' };
    }

    const typedAlert = alert as Alert & { sites: { user_id: string } };

    if (typedAlert.sites.user_id !== user.id) {
      return { success: false, error: 'Alert not found' };
    }

    // Update alert
    const { data: updated, error: updateError } = await supabase
      .from('alerts')
      .update({ read: true } as never)
      .eq('id', alertId)
      .select()
      .single();

    if (updateError) {
      console.error('Error marking alert as read:', updateError);
      return { success: false, error: 'Failed to update alert' };
    }

    revalidatePath('/monitoring');

    return { success: true, data: updated as Alert };
  } catch (error) {
    console.error('Error in markAlertAsRead:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Dismisses an alert
 *
 * @param alertId - Alert ID
 * @returns Action result
 */
export async function dismissAlert(alertId: string): Promise<ActionResult<Alert>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const { data: alert, error: fetchError } = await supabase
      .from('alerts')
      .select(`
        *,
        sites!inner (user_id)
      `)
      .eq('id', alertId)
      .single();

    if (fetchError || !alert) {
      return { success: false, error: 'Alert not found' };
    }

    const typedAlert = alert as Alert & { sites: { user_id: string } };

    if (typedAlert.sites.user_id !== user.id) {
      return { success: false, error: 'Alert not found' };
    }

    // Update alert
    const { data: updated, error: updateError } = await supabase
      .from('alerts')
      .update({ dismissed: true, read: true } as never)
      .eq('id', alertId)
      .select()
      .single();

    if (updateError) {
      console.error('Error dismissing alert:', updateError);
      return { success: false, error: 'Failed to dismiss alert' };
    }

    revalidatePath('/monitoring');

    return { success: true, data: updated as Alert };
  } catch (error) {
    console.error('Error in dismissAlert:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates alert settings for a site
 * Note: In a real implementation, this would update a separate settings table
 *
 * @param input - Site ID and settings
 * @returns Action result with settings
 */
export async function updateAlertSettings(
  input: z.infer<typeof updateAlertSettingsSchema>
): Promise<ActionResult<AlertSettings>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parseResult = updateAlertSettingsSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { siteId, settings } = parseResult.data;

    // Verify site ownership
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!site) {
      return { success: false, error: 'Site not found' };
    }

    // In a real implementation, save to a settings table
    // For now, we'll just return the settings as if they were saved
    const savedSettings: AlertSettings = {
      emailNotifications: settings.emailNotifications ?? true,
      scoreDropThreshold: settings.scoreDropThreshold ?? 10,
      alertTypes: settings.alertTypes ?? [
        'content_decay',
        'visibility_drop',
        'score_change',
      ],
    };

    revalidatePath('/monitoring');

    return { success: true, data: savedSettings };
  } catch (error) {
    console.error('Error in updateAlertSettings:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Marks all alerts as read for a site
 *
 * @param siteId - Site ID
 * @returns Action result with count of updated alerts
 */
export async function markAllAlertsAsRead(
  siteId: string
): Promise<ActionResult<{ count: number }>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify site ownership
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!site) {
      return { success: false, error: 'Site not found' };
    }

    // Update all unread alerts
    const { data, error } = await supabase
      .from('alerts')
      .update({ read: true } as never)
      .eq('site_id', siteId)
      .eq('read', false)
      .select('id');

    if (error) {
      console.error('Error marking alerts as read:', error);
      return { success: false, error: 'Failed to update alerts' };
    }

    revalidatePath('/monitoring');

    return { success: true, data: { count: data?.length || 0 } };
  } catch (error) {
    console.error('Error in markAllAlertsAsRead:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
