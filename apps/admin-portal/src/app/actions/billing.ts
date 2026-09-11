'use server';

import { revalidatePath } from 'next/cache';

// Mocked DB interface for the Server Action
// In production, this imports your secure PostgreSQL ORM or Supabase client
async function dbQuery(query: string, values: any[], role: string) {
  console.log(`[DB Query Executed as ${role}]:`, query, values);
  // Simulating successful Postgres execution
  return { success: true };
}

export async function updateTenantSubscription(formData: FormData) {
  const tenantId = formData.get('tenantId') as string;
  const planId = formData.get('planId') as string;
  const status = formData.get('status') as string;
  
  // Security Layer 1: Context Verification
  // Here you extract the current user's role from their JWT or session token
  const currentUserRole = 'super_admin'; // Mocking secure session retrieval
  
  if (currentUserRole !== 'super_admin') {
    throw new Error('403 Forbidden: You do not have permission to modify subscriptions.');
  }
  
  // Security Layer 2: Secure Database Execution
  // This explicitly sets the Postgres context before running the update, 
  // relying entirely on the hardened RLS policies in the database.
  
  const query = `
    -- Explicitly set role for RLS policy enforcement
    SET LOCAL app.current_role = $1;
    
    UPDATE tenant_subscriptions 
    SET plan_id = $2, 
        status = $3, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE tenant_id = $4;
  `;
  
  const values = [currentUserRole, planId, status, tenantId];
  
  try {
    await dbQuery(query, values, currentUserRole);
    
    // Purge the cache so the UI reflects the updated subscription
    revalidatePath(`/tenants/${tenantId}/billing`);
    
    return { success: true, message: 'Subscription securely updated.' };
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return { success: false, message: 'Internal Server Error' };
  }
}
