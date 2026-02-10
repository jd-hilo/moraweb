# Anonymous Simulations - No Account Required

## Overview

Users can now create simulations without creating an account. The onboarding flow has been updated to skip authentication entirely.

## Changes Made

### 1. Landing Page (`src/pages/LandingPage.tsx`)
- Removed authentication check
- "Begin" button now goes directly to `/onboarding/name` instead of `/auth`
- Removed unused Supabase imports

### 2. Clarifier Screen (`src/pages/onboarding/ClarifierScreen.tsx`)
- Removed authentication requirement
- Removed database save to `profiles` table
- Onboarding data is stored in localStorage only (via `OnboardingContext`)
- Navigates directly to `/simulate-life` instead of `/payment`

### 3. Simulate Life Page (`src/pages/SimulateLifePage.tsx`)
- Removed authentication check
- Allows creating simulations without a user account
- `user_id` is set to `null` when saving to database
- Falls back to passing simulation data directly if database save fails

### 4. Simulation Results Page (`src/pages/SimulationResultsPage.tsx`)
- Updated to handle simulation data passed directly in `location.state`
- Works with both database-saved simulations and anonymous simulations

### 5. Database Migration (`supabase/migrations/20250209000000_allow_anonymous_simulations.sql`)
- Makes `websims.user_id` nullable
- Updates RLS policies to allow anonymous/public inserts
- Allows anyone (authenticated or not) to create simulations

### 6. Consolidated Migration (`supabase/migrations/run_all_migrations.sql`)
- Updated to include anonymous simulation support from the start
- New databases will have `user_id` nullable by default

## Database Changes

### websims Table
- `user_id` is now nullable (can be `NULL` for anonymous users)
- Foreign key constraint updated to allow `NULL` values

### RLS Policies
- **Insert**: `"Anyone can insert websims"` - allows public/anonymous inserts
- **Select**: Existing policies allow viewing (public can view by ID)
- **Update**: Authenticated users can update their own, or anonymous ones (though anonymous ones typically won't be updated)

## User Flow

### Before (Required Account)
1. Landing Page → Auth Screen (sign up/login)
2. Onboarding screens
3. Save to database (requires auth)
4. Payment screen
5. Simulation generation

### After (No Account Required)
1. Landing Page → Onboarding screens (direct)
2. Onboarding data stored in localStorage
3. Simulation generation (no auth required)
4. Results displayed immediately

## Running the Migration

If you have an existing database, run the migration:

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/20250209000000_allow_anonymous_simulations.sql
```

For new databases, use the consolidated migration:

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/run_all_migrations.sql
```

## Notes

- Onboarding data is stored in `localStorage` via `OnboardingContext`
- Simulations can be saved to database with `user_id = null`
- If database save fails, simulation data is passed directly to results page
- Anonymous simulations can still be shared via URL (if saved to DB)
- Users can still create accounts if they want (auth routes still exist)

## Testing

1. Clear browser localStorage
2. Navigate to landing page
3. Click "Begin" - should go directly to onboarding
4. Complete onboarding flow
5. Generate simulation - should work without authentication
6. View results - should display correctly
