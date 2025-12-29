import { supabase } from './supabase';

/**
 * Get user profile by user_id
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data;
}

/**
 * Generate a unique twin code for a user
 */
function generateTwinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Save individual onboarding step response to core_json.onboarding_responses[step]
 * Preserves existing core_json and values_json
 */
export async function saveOnboardingResponse(
  userId: string,
  step: string,
  response: any
) {
  // Fetch existing profile to preserve data
  const existingProfile = await getProfile(userId);
  const currentCoreJson = existingProfile?.core_json || {};
  const existingResponses = currentCoreJson.onboarding_responses || {};

  // Merge new response into onboarding_responses
  const updatedCoreJson = {
    ...currentCoreJson,
    onboarding_responses: {
      ...existingResponses,
      [step]: response,
    },
  };

  // Build upsert payload preserving all existing fields
  const upsertPayload: any = {
    user_id: userId,
    core_json: updatedCoreJson,
    values_json: existingProfile?.values_json || [],
  };

  // Preserve all other existing fields
  if (existingProfile) {
    Object.keys(existingProfile).forEach((key) => {
      if (key !== 'user_id' && key !== 'core_json' && key !== 'values_json') {
        upsertPayload[key] = existingProfile[key];
      }
    });
  }

  // Generate twin code if profile is new
  if (!existingProfile?.twin_code) {
    upsertPayload.twin_code = generateTwinCode();
  }

  // Upsert profile
  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error in saveOnboardingResponse:', error);
    throw error;
  }

  // Verify save with a small delay for DB consistency
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Re-fetch to verify
  const verify = await getProfile(userId);
  const saved = verify?.core_json?.onboarding_responses?.[step];

  if (JSON.stringify(saved) !== JSON.stringify(response)) {
    throw new Error(`Save verification failed for step: ${step}`);
  }

  return data;
}

/**
 * Update structured profile fields (e.g., first_name, hometown)
 * Preserves core_json and values_json
 */
export async function updateProfileFields(
  userId: string,
  fields: Partial<{
    first_name: string | null;
    hometown: string | null;
    university: string | null;
    major: string | null;
    career_entrypoint: string | null;
    current_location: string | null;
    net_worth: string | null;
    political_views: string | null;
    family_relationship: string | null;
    [key: string]: any;
  }>
) {
  // Fetch existing profile to preserve data
  const existingProfile = await getProfile(userId);

  // Build upsert payload preserving JSON fields
  const upsertPayload: any = {
    user_id: userId,
    core_json: existingProfile?.core_json || {},
    values_json: existingProfile?.values_json || [],
    ...fields, // Merge new fields
  };

  // Preserve all other existing fields that aren't being updated
  if (existingProfile) {
    Object.keys(existingProfile).forEach((key) => {
      if (
        key !== 'user_id' &&
        key !== 'core_json' &&
        key !== 'values_json' &&
        !(key in fields)
      ) {
        upsertPayload[key] = existingProfile[key];
      }
    });
  }

  // Generate twin code if profile is new
  if (!existingProfile?.twin_code) {
    upsertPayload.twin_code = generateTwinCode();
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error in updateProfileFields:', error);
    throw error;
  }

  return data;
}

/**
 * Update core_json, values_json, narrative summary, and embedding
 */
export async function upsertProfileCore(
  userId: string,
  options: {
    coreJson?: any;
    valuesJson?: string[];
    narrativeSummary?: string;
    narrativeEmbedding?: any; // Vector(1536)
  }
) {
  const existingProfile = await getProfile(userId);

  const upsertPayload: any = {
    user_id: userId,
    core_json: options.coreJson ?? existingProfile?.core_json ?? {},
    values_json: options.valuesJson ?? existingProfile?.values_json ?? [],
  };

  if (options.narrativeSummary !== undefined) {
    upsertPayload.narrative_summary = options.narrativeSummary;
  }

  if (options.narrativeEmbedding !== undefined) {
    upsertPayload.narrative_embedding = options.narrativeEmbedding;
  }

  // Preserve all other existing fields
  if (existingProfile) {
    Object.keys(existingProfile).forEach((key) => {
      if (
        key !== 'user_id' &&
        key !== 'core_json' &&
        key !== 'values_json' &&
        key !== 'narrative_summary' &&
        key !== 'narrative_embedding'
      ) {
        upsertPayload[key] = existingProfile[key];
      }
    });
  }

  // Generate twin code if profile is new
  if (!existingProfile?.twin_code) {
    upsertPayload.twin_code = generateTwinCode();
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error in upsertProfileCore:', error);
    throw error;
  }

  return data;
}

/**
 * Complete onboarding by setting onboarding_complete: true
 */
export async function completeOnboarding(
  userId: string,
  onboardingData?: {
    first_name?: string;
    hometown?: string;
    university?: string;
    [key: string]: any;
  }
) {
  const existingProfile = await getProfile(userId);
  const currentCoreJson = existingProfile?.core_json || {};
  const onboardingResponses = currentCoreJson.onboarding_responses || {};

  // Build final core_json with onboarding_complete flag
  const finalCoreJson = {
    ...currentCoreJson,
    onboarding_responses: {
      ...onboardingResponses,
      ...(onboardingData || {}),
    },
    onboarding_complete: true, // Key flag
  };

  // Build upsert payload
  const upsertPayload: any = {
    user_id: userId,
    core_json: finalCoreJson,
    values_json: existingProfile?.values_json || [],
  };

  // Update structured fields if provided, otherwise preserve existing
  if (onboardingData) {
    if (onboardingData.first_name !== undefined) {
      upsertPayload.first_name = onboardingData.first_name || existingProfile?.first_name || null;
    }
    if (onboardingData.hometown !== undefined) {
      upsertPayload.hometown = onboardingData.hometown || existingProfile?.hometown || null;
    }
    if (onboardingData.university !== undefined) {
      upsertPayload.university = onboardingData.university || existingProfile?.university || null;
    }
  } else {
    // Preserve existing structured fields
    if (existingProfile?.first_name) upsertPayload.first_name = existingProfile.first_name;
    if (existingProfile?.hometown) upsertPayload.hometown = existingProfile.hometown;
    if (existingProfile?.university) upsertPayload.university = existingProfile.university;
  }

  // Preserve all other existing fields
  if (existingProfile) {
    Object.keys(existingProfile).forEach((key) => {
      if (
        key !== 'user_id' &&
        key !== 'core_json' &&
        key !== 'values_json' &&
        key !== 'first_name' &&
        key !== 'hometown' &&
        key !== 'university'
      ) {
        upsertPayload[key] = existingProfile[key];
      }
    });
  }

  // Generate twin code if missing
  if (!existingProfile?.twin_code) {
    upsertPayload.twin_code = generateTwinCode();
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error in completeOnboarding:', error);
    throw error;
  }

  return data;
}



