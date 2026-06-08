# Services

This folder contains functions responsible for directly calling the API and Supabase endpoints.
All data fetching logic, mutations, and Supabase RPC calls should reside here.

## Data Flow

1. **Components/Pages** trigger actions.
2. **Hooks** (in `src/hooks/`) manage the React state and call functions from `src/services/`.
3. **Services** execute the actual data fetching from Supabase or external APIs and return the data to the hooks.
